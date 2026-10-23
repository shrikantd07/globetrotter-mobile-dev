import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Trip, Activity, GeneratedItinerary } from '../types/travel';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { calculateTripDuration, generateShareToken, sortActivities } from '../utils/travel-calc';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  activities: Activity[];
  allActivities: Activity[];
  isLoading: boolean;
  loadTrips: () => Promise<void>;
  selectTrip: (tripId: string | null) => Promise<void>;
  createTrip: (tripData: Partial<Trip>) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<Trip>;
  deleteTrip: (tripId: string) => Promise<void>;
  addActivity: (activityData: Partial<Activity>) => Promise<Activity>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<Activity>;
  deleteActivity: (activityId: string) => Promise<void>;
  reorderActivities: (dayIndex: number, orderedIds: string[]) => Promise<void>;
  moveActivityToDay: (activityId: string, targetDayIndex: number) => Promise<void>;
  toggleShareTrip: (tripId: string, enable: boolean) => Promise<string | undefined>;
  importAiItineraryToTrip: (tripId: string, aiData: GeneratedItinerary) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.getTrips(user?.id);
      setTrips(data);
      const allActs = await StorageService.getAllActivities();
      setAllActivities(allActs);

      if (activeTrip) {
        const fresh = data.find(t => t.id === activeTrip.id);
        setActiveTrip(fresh || null);
        if (fresh) {
          const acts = await StorageService.getActivitiesForTrip(fresh.id);
          setActivities(sortActivities(acts));
        } else {
          setActivities(sortActivities(allActs));
        }
      } else {
        setActivities(sortActivities(allActs));
      }
    } catch (e) {
      console.error('Failed to load trips:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeTrip?.id]);

  useEffect(() => {
    loadTrips();
  }, [user?.id]);

  const selectTrip = useCallback(async (tripId: string | null) => {
    if (!tripId) {
      setActiveTrip(null);
      const allActs = await StorageService.getAllActivities();
      setActivities(sortActivities(allActs));
      return;
    }
    const found = trips.find(t => t.id === tripId) || (await StorageService.getTripById(tripId));
    setActiveTrip(found || null);
    if (found) {
      const acts = await StorageService.getActivitiesForTrip(found.id);
      setActivities(sortActivities(acts));
    } else {
      const allActs = await StorageService.getAllActivities();
      setActivities(sortActivities(allActs));
    }
  }, [trips]);

  const createTrip = async (tripData: Partial<Trip>): Promise<Trip> => {
    const id = `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const duration = calculateTripDuration(tripData.startDate || '', tripData.endDate || '');

    const newTrip: Trip = {
      id,
      userId: user?.id || 'guest',
      title: tripData.title || `${tripData.destination || 'Uncharted'} Journey`,
      destination: tripData.destination || 'Destination',
      country: tripData.country || '',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date().toISOString().split('T')[0],
      durationDays: duration,
      budget: Number(tripData.budget) || 1500,
      currency: tripData.currency || 'USD',
      description: tripData.description || 'An inspiring voyage planned with GlobeTrotter.',
      coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      travelStyle: tripData.travelStyle || 'Balanced',
      travelerCount: Number(tripData.travelerCount) || 1,
      isPublic: Boolean(tripData.isPublic),
      shareToken: tripData.isPublic ? generateShareToken(id) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await StorageService.saveTrip(newTrip);
    setTrips(prev => [saved, ...prev]);
    setActiveTrip(saved);
    setActivities([]);
    return saved;
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>): Promise<Trip> => {
    const existing = trips.find(t => t.id === tripId) || (await StorageService.getTripById(tripId));
    if (!existing) throw new Error('Trip not found');

    const duration = calculateTripDuration(
      updates.startDate || existing.startDate,
      updates.endDate || existing.endDate
    );

    const updated: Trip = {
      ...existing,
      ...updates,
      durationDays: duration,
      updatedAt: new Date().toISOString(),
    };

    await StorageService.saveTrip(updated);
    setTrips(prev => prev.map(t => (t.id === tripId ? updated : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updated);
    }
    return updated;
  };

  const deleteTrip = async (tripId: string): Promise<void> => {
    await StorageService.deleteTrip(tripId);
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (activeTrip?.id === tripId) {
      setActiveTrip(null);
      setActivities([]);
    }
  };

  const addActivity = async (activityData: Partial<Activity>): Promise<Activity> => {
    if (!activeTrip) throw new Error('No active trip selected');

    const id = `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const dayActivities = activities.filter(a => a.dayIndex === (activityData.dayIndex || 1));
    const nextOrder = dayActivities.length;

    const newActivity: Activity = {
      id,
      tripId: activeTrip.id,
      dayIndex: activityData.dayIndex || 1,
      date: activityData.date,
      name: activityData.name || 'New Experience',
      category: activityData.category || 'sightseeing',
      startTime: activityData.startTime || '10:00 AM',
      endTime: activityData.endTime,
      location: activityData.location || activeTrip.destination,
      description: activityData.description || '',
      estimatedCost: Number(activityData.estimatedCost) || 0,
      actualCost: activityData.actualCost !== undefined ? Number(activityData.actualCost) : undefined,
      currency: activityData.currency || activeTrip.currency,
      notes: activityData.notes || '',
      orderIndex: nextOrder,
      completed: Boolean(activityData.completed),
    };

    const saved = await StorageService.saveActivity(newActivity);
    setActivities(prev => sortActivities([...prev, saved]));
    return saved;
  };

  const updateActivity = async (activityId: string, updates: Partial<Activity>): Promise<Activity> => {
    const existing = activities.find(a => a.id === activityId);
    if (!existing) throw new Error('Activity not found');

    const updated: Activity = { ...existing, ...updates };
    await StorageService.saveActivity(updated);
    setActivities(prev => sortActivities(prev.map(a => (a.id === activityId ? updated : a))));
    return updated;
  };

  const deleteActivity = async (activityId: string): Promise<void> => {
    await StorageService.deleteActivity(activityId);
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const reorderActivities = async (dayIndex: number, orderedIds: string[]): Promise<void> => {
    const otherDays = activities.filter(a => a.dayIndex !== dayIndex);
    const dayActs = activities.filter(a => a.dayIndex === dayIndex);

    const reordered: Activity[] = orderedIds.map((id, index) => {
      const act = dayActs.find(a => a.id === id)!;
      return { ...act, orderIndex: index };
    });

    const combined = sortActivities([...otherDays, ...reordered]);
    setActivities(combined);
    await StorageService.saveActivitiesBatch(reordered);
  };

  const moveActivityToDay = async (activityId: string, targetDayIndex: number): Promise<void> => {
    const existing = activities.find(a => a.id === activityId);
    if (!existing) return;

    const targetDayActs = activities.filter(a => a.dayIndex === targetDayIndex);
    const updated: Activity = {
      ...existing,
      dayIndex: targetDayIndex,
      orderIndex: targetDayActs.length,
    };

    await StorageService.saveActivity(updated);
    setActivities(prev => sortActivities(prev.map(a => (a.id === activityId ? updated : a))));
  };

  const toggleShareTrip = async (tripId: string, enable: boolean): Promise<string | undefined> => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return undefined;

    const token = enable ? (trip.shareToken || generateShareToken(tripId)) : undefined;
    const updated = await updateTrip(tripId, { isPublic: enable, shareToken: token });
    return updated.shareToken;
  };

  const importAiItineraryToTrip = async (tripId: string, aiData: GeneratedItinerary): Promise<void> => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newActivities: Activity[] = [];
    aiData.days.forEach(day => {
      day.activities.forEach((item, idx) => {
        const id = `act-ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        newActivities.push({
          id,
          tripId,
          dayIndex: day.dayNumber,
          name: item.name,
          category: item.category,
          startTime: item.startTime,
          endTime: item.endTime,
          location: item.location || trip.destination,
          description: item.description,
          estimatedCost: Number(item.estimatedCost) || 0,
          currency: aiData.currency || trip.currency,
          notes: item.notes || '',
          orderIndex: idx,
          completed: false,
        });
      });
    });

    await StorageService.saveActivitiesBatch(newActivities);
    const refreshed = await StorageService.getActivitiesForTrip(tripId);
    setActivities(sortActivities(refreshed));

    // Update trip summary description if empty or default
    if (aiData.overview) {
      await updateTrip(tripId, { description: aiData.overview });
    }
  };

  const value = useMemo(() => ({
    trips,
    activeTrip,
    activities,
    allActivities,
    isLoading,
    loadTrips,
    selectTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    moveActivityToDay,
    toggleShareTrip,
    importAiItineraryToTrip,
  }), [trips, activeTrip, activities, allActivities, isLoading, selectTrip]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used within a TripProvider');
  return context;
};
