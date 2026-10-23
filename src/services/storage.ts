import { Trip, Activity, UserProfile } from '../types/travel';
import { SEED_TRIPS, SEED_ACTIVITIES, SEED_DEMO_USER_ID } from '../data/seedTrips';
import { getSupabaseClient } from '../lib/supabase';

const TRIPS_KEY = 'gt_trips_v1';
const ACTIVITIES_KEY = 'gt_activities_v1';
const PROFILE_KEY = 'gt_profile_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: SEED_DEMO_USER_ID,
  email: 'boramaniharshita@gmail.com',
  displayName: 'Harshita Boramani',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Architectural photographer & slow-travel enthusiast. Seeking cultural immersions, coastal walks, and authentic culinary heritage.',
  homeAirport: 'SFO',
  preferredCurrency: 'USD',
  travelStyle: 'Luxury & Cultural',
  createdAt: '2026-01-10T00:00:00Z',
};

export class StorageService {
  // Initialize default data if absent
  static initLocalStorage(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(TRIPS_KEY)) {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(SEED_TRIPS));
    }
    if (!localStorage.getItem(ACTIVITIES_KEY)) {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(SEED_ACTIVITIES));
    }
    if (!localStorage.getItem(PROFILE_KEY)) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
    }
  }

  // --- Profile Operations ---
  static async getProfile(userId: string): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (data && !error) return data as UserProfile;
      } catch (e) {
        console.warn('Supabase profile fetch error, falling back to local storage', e);
      }
    }

    this.initLocalStorage();
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_USER_PROFILE;
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.initLocalStorage();
    const current = await this.getProfile(profile.id || DEFAULT_USER_PROFILE.id);
    const updated: UserProfile = { ...current, ...profile };

    const supabase = getSupabaseClient();
    if (supabase && profile.id) {
      try {
        await supabase.from('profiles').upsert(updated);
      } catch (e) {
        console.warn('Supabase profile upsert error', e);
      }
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }

  // --- Trip Operations ---
  static async getTrips(userId?: string): Promise<Trip[]> {
    const supabase = getSupabaseClient();
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('userId', userId)
          .order('startDate', { ascending: true });
        if (data && !error && data.length > 0) return data as Trip[];
      } catch (e) {
        console.warn('Supabase trips fetch error, falling back to local storage', e);
      }
    }

    this.initLocalStorage();
    const raw = localStorage.getItem(TRIPS_KEY);
    const trips: Trip[] = raw ? JSON.parse(raw) : SEED_TRIPS;
    return trips;
  }

  static async getTripById(tripId: string): Promise<Trip | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
        if (data && !error) return data as Trip;
      } catch (e) {
        console.warn('Supabase trip by id fetch error', e);
      }
    }

    const trips = await this.getTrips();
    return trips.find(t => t.id === tripId) || null;
  }

  static async getTripByShareToken(token: string): Promise<{ trip: Trip; activities: Activity[] } | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: trip, error } = await supabase
          .from('trips')
          .select('*')
          .eq('shareToken', token)
          .eq('isPublic', true)
          .single();
        if (trip && !error) {
          const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('tripId', trip.id);
          return { trip: trip as Trip, activities: (activities || []) as Activity[] };
        }
      } catch (e) {
        console.warn('Supabase share token fetch error', e);
      }
    }

    const trips = await this.getTrips();
    const trip = trips.find(t => t.shareToken === token && t.isPublic);
    if (!trip) return null;

    const activities = await this.getActivitiesForTrip(trip.id);
    return { trip, activities };
  }

  static async saveTrip(trip: Trip): Promise<Trip> {
    this.initLocalStorage();
    const trips = await this.getTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);

    let updatedTrips: Trip[];
    if (existingIndex >= 0) {
      updatedTrips = [...trips];
      updatedTrips[existingIndex] = { ...trip, updatedAt: new Date().toISOString() };
    } else {
      updatedTrips = [trip, ...trips];
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('trips').upsert(trip);
      } catch (e) {
        console.warn('Supabase trip upsert error', e);
      }
    }

    localStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    return trip;
  }

  static async deleteTrip(tripId: string): Promise<boolean> {
    this.initLocalStorage();
    const trips = await this.getTrips();
    const filteredTrips = trips.filter(t => t.id !== tripId);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(filteredTrips));

    // Also remove activities
    const rawActs = localStorage.getItem(ACTIVITIES_KEY);
    if (rawActs) {
      const acts: Activity[] = JSON.parse(rawActs);
      const filteredActs = acts.filter(a => a.tripId !== tripId);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActs));
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('activities').delete().eq('tripId', tripId);
        await supabase.from('trips').delete().eq('id', tripId);
      } catch (e) {
        console.warn('Supabase trip delete error', e);
      }
    }

    return true;
  }

  // --- Activity Operations ---
  static async getAllActivities(): Promise<Activity[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('activities').select('*');
        if (data && !error && data.length > 0) return data as Activity[];
      } catch (e) {
        console.warn('Supabase all activities error', e);
      }
    }
    this.initLocalStorage();
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : SEED_ACTIVITIES;
  }

  static async getActivitiesForTrip(tripId: string): Promise<Activity[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('tripId', tripId);
        if (data && !error && data.length > 0) return data as Activity[];
      } catch (e) {
        console.warn('Supabase activities fetch error', e);
      }
    }

    this.initLocalStorage();
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    const allActivities: Activity[] = raw ? JSON.parse(raw) : SEED_ACTIVITIES;
    return allActivities.filter(a => a.tripId === tripId);
  }

  static async saveActivity(activity: Activity): Promise<Activity> {
    this.initLocalStorage();
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    const allActivities: Activity[] = raw ? JSON.parse(raw) : SEED_ACTIVITIES;

    const existingIndex = allActivities.findIndex(a => a.id === activity.id);
    let updated: Activity[];
    if (existingIndex >= 0) {
      updated = [...allActivities];
      updated[existingIndex] = activity;
    } else {
      updated = [...allActivities, activity];
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('activities').upsert(activity);
      } catch (e) {
        console.warn('Supabase activity upsert error', e);
      }
    }

    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    return activity;
  }

  static async deleteActivity(activityId: string): Promise<boolean> {
    this.initLocalStorage();
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return true;

    const allActivities: Activity[] = JSON.parse(raw);
    const filtered = allActivities.filter(a => a.id !== activityId);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('activities').delete().eq('id', activityId);
      } catch (e) {
        console.warn('Supabase activity delete error', e);
      }
    }

    return true;
  }

  static async saveActivitiesBatch(activities: Activity[]): Promise<void> {
    this.initLocalStorage();
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    const allActivities: Activity[] = raw ? JSON.parse(raw) : SEED_ACTIVITIES;

    const idsToUpdate = new Set(activities.map(a => a.id));
    const kept = allActivities.filter(a => !idsToUpdate.has(a.id));
    const combined = [...kept, ...activities];

    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(combined));

    const supabase = getSupabaseClient();
    if (supabase && activities.length > 0) {
      try {
        await supabase.from('activities').upsert(activities);
      } catch (e) {
        console.warn('Supabase batch activities upsert error', e);
      }
    }
  }

  static resetToDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TRIPS_KEY, JSON.stringify(SEED_TRIPS));
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(SEED_ACTIVITIES));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
  }
}
