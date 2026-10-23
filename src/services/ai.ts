import { GeneratedItinerary, Trip, Activity } from '../types/travel';

export interface GenerateItineraryParams {
  destination: string;
  startDate?: string;
  endDate?: string;
  daysCount: number;
  budget?: number;
  currency?: string;
  interests?: string[];
  travelStyle?: string;
  travelerCount?: number;
  naturalLanguageRequirements?: string;
}

export interface GenerateItineraryResult {
  success: boolean;
  isAiGenerated: boolean;
  warning?: string;
  itinerary: GeneratedItinerary;
  error?: string;
}

export interface OptimizationRecommendation {
  category: string;
  title: string;
  description: string;
  potentialSavings?: string;
}

export interface ItineraryOptimization {
  summary: string;
  pacingScore: number;
  budgetHealthScore: number;
  sequenceScore: number;
  estimatedTotalSavings?: number;
  recommendations: OptimizationRecommendation[];
  optimizedActivities: Activity[];
}

export interface OptimizeItineraryResult {
  success: boolean;
  isAiGenerated: boolean;
  warning?: string;
  optimization: ItineraryOptimization;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActivity?: Partial<Activity>;
}

export interface TripChatResult {
  success: boolean;
  isAiGenerated: boolean;
  reply: string;
  suggestedActions?: { label: string; prompt: string }[];
  error?: string;
}

export async function requestAiItinerary(params: GenerateItineraryParams): Promise<GenerateItineraryResult> {
  try {
    const response = await fetch('/api/ai/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`AI Service HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to request AI itinerary:', error);
    return {
      success: false,
      isAiGenerated: false,
      error: error?.message || 'Failed to connect to itinerary generation service.',
      itinerary: {
        title: `${params.destination} Highlights`,
        tagline: 'Custom travel plan',
        destination: params.destination,
        overview: `A curated itinerary for ${params.destination}.`,
        totalEstimatedCost: params.budget || 1200,
        currency: params.currency || 'USD',
        insiderTips: ['Check local opening hours before visiting.'],
        days: [
          {
            dayNumber: 1,
            theme: 'Arrival & Neighborhood Discovery',
            activities: [
              {
                name: 'Check-in & Stroll',
                category: 'sightseeing',
                startTime: '10:00 AM',
                location: `${params.destination} Center`,
                description: 'Explore the central plaza and surrounding markets.',
                estimatedCost: 30,
              }
            ]
          }
        ]
      }
    };
  }
}

export async function requestAiOptimization(params: {
  trip: Trip;
  activities: Activity[];
  optimizationGoal?: string;
}): Promise<OptimizeItineraryResult> {
  try {
    const response = await fetch('/api/ai/optimize-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`AI Optimization HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to request AI optimization:', error);
    return {
      success: false,
      isAiGenerated: false,
      error: error?.message || 'Failed to connect to itinerary optimization service.',
      optimization: {
        summary: `Analyzed ${params.activities.length} activities across ${params.trip.durationDays} days.`,
        pacingScore: 85,
        budgetHealthScore: 88,
        sequenceScore: 84,
        recommendations: [
          {
            category: 'Pacing',
            title: 'Balanced Activity Sequencing',
            description: 'Stagger high-energy walking excursions with relaxing midday café breaks.'
          }
        ],
        optimizedActivities: params.activities
      }
    };
  }
}

export async function sendTripChatMessage(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  tripContext: Partial<Trip> & { activities?: Activity[] };
  userProfile?: any;
}): Promise<TripChatResult> {
  try {
    const response = await fetch('/api/ai/trip-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`AI Chat HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to send trip chat message:', error);
    return {
      success: false,
      isAiGenerated: false,
      reply: `I am currently in offline mode. For **${params.tripContext.destination || 'your destination'}**, remember to reserve popular attractions in advance and keep afternoon buffers to avoid travel fatigue!`,
      error: error?.message
    };
  }
}
