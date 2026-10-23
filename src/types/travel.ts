export type ActivityCategory = 
  | 'sightseeing' 
  | 'food' 
  | 'transport' 
  | 'lodging' 
  | 'experience' 
  | 'shopping' 
  | 'other';

export interface Activity {
  id: string;
  tripId: string;
  dayIndex: number; // 1-based index (Day 1, Day 2...)
  date?: string; // e.g. "2026-11-02"
  name: string;
  category: ActivityCategory;
  startTime?: string; // e.g. "09:30 AM"
  endTime?: string; // e.g. "11:30 AM"
  location: string;
  description?: string;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  notes?: string;
  orderIndex: number;
  completed?: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  country?: string;
  startDate: string; // ISO date "YYYY-MM-DD"
  endDate: string; // ISO date "YYYY-MM-DD"
  durationDays: number;
  budget: number;
  currency: string;
  description: string;
  coverImage: string;
  travelStyle: 'Luxury' | 'Cultural' | 'Adventure' | 'Culinary' | 'Relaxed' | 'Balanced';
  travelerCount: number;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  homeAirport?: string;
  preferredCurrency: string;
  travelStyle: string;
  language?: string;
  savedDestinations?: string[];
  createdAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
  tagline: string;
  description: string;
  coverImage: string;
  bestMonths: string;
  averageDailyCost: number;
  currency: string;
  highlights: string[];
  suggestedActivities: {
    name: string;
    category: ActivityCategory;
    estCost: number;
    description: string;
  }[];
}

export interface GeneratedItineraryActivity {
  name: string;
  category: ActivityCategory;
  startTime: string;
  endTime?: string;
  location: string;
  description: string;
  estimatedCost: number;
  notes?: string;
}

export interface GeneratedItineraryDay {
  dayNumber: number;
  theme: string;
  date?: string;
  activities: GeneratedItineraryActivity[];
}

export interface GeneratedItinerary {
  title: string;
  tagline: string;
  destination: string;
  overview: string;
  totalEstimatedCost: number;
  currency: string;
  insiderTips: string[];
  days: GeneratedItineraryDay[];
}
