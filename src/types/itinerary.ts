export interface UserTripPreferences {
  destination: string;
  days: number;
  travelerType: 'solo' | 'couple' | 'family' | 'friends';
  budget: 'cheap' | 'moderate' | 'luxury';
  themes: string[];
}

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  primaryType?: string;
}

export interface ItineraryActivity {
  time: string;
  type: 'attraction' | 'meal' | 'accommodation' | 'transport';
  name: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  placeId?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface GeneratedItinerary {
  destination: string;
  totalDays: number;
  itinerary: ItineraryDay[];
}

export interface DisplayActivity {
  time: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  cost: string;
  type: 'attraction' | 'meal' | 'transport' | 'accommodation';
  image?: string;
  coordinates?: { lat: number; lng: number };
}

export interface DisplayDayPlan {
  day: number;
  date: string;
  activities: DisplayActivity[];
}

export interface ItineraryResponse {
  destination: string;
  totalDays: number;
  estimatedCost: string;
  humorousTitle: string;
  summary: string;
  dayPlans: DisplayDayPlan[];
}
