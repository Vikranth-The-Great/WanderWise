import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { scheduleAttractionsForDay } from './attraction-time-scheduler';

// Interfaces for the TravelAI workflow
export interface AttractionCSVData {
  Place: string;
  Attraction: string;
  Travel_Theme: string;
  'Opening_Time - Closing_Time': string;
  Visit_Duration: string;
  A_id: string;
  latitude: string;
  longitude: string;
  Rating?: string;
  Rating_Count?: string;
}

export interface ParsedAttraction {
  orig_id: string;
  name: string;
  place: string;
  opening_intervals: string[];
  visit_minutes: number;
  latitude: number;
  longitude: number;
  themes: string;
  rating?: number;
}

export interface UserPreferences {
  type_of_group: string;
  destinations: string[];
  destinationDays?: Record<string, number>;
  age: number;
  budget: string;
  themes: string[];
  days: number;
}

export interface ScheduledDay {
  destination: string;
  day: number;
  meals: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  visits: {
    num: number;
    orig_id: string;
    name: string;
    start: string;
    end: string;
    duration_min: number;
    opening_intervals: string;
  }[];
}

// Time normalization utilities
export function to_24h(timeStr: string): string {
  if (!timeStr || timeStr.trim() === '') return '09:00';

  const cleanTime = timeStr.trim().toUpperCase();

  // If already in 24-hour format, return as is
  if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
    const [hours, minutes] = cleanTime.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Handle AM/PM format
  const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!match) {
    console.warn(`Invalid time format: ${timeStr}, defaulting to 09:00`);
    return '09:00';
  }

  let [, hours, minutes, period] = match;
  let hour24 = parseInt(hours);

  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
}

export function duration_to_minutes(durationStr: string): number {
  if (!durationStr || durationStr.trim() === '') return 120; // Default 2 hours

  const cleanDuration = durationStr.toLowerCase().trim();

  // Handle "X-Y hours" format
  const rangeMatch = cleanDuration.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hours?/);
  if (rangeMatch) {
    const [, min, max] = rangeMatch;
    const avgHours = (parseFloat(min) + parseFloat(max)) / 2;
    return Math.round(avgHours * 60);
  }

  // Handle "X hours" format
  const hoursMatch = cleanDuration.match(/(\d+(?:\.\d+)?)\s*hours?/);
  if (hoursMatch) {
    return Math.round(parseFloat(hoursMatch[1]) * 60);
  }

  // Handle "X minutes" format
  const minutesMatch = cleanDuration.match(/(\d+)\s*minutes?/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }

  console.warn(`Invalid duration format: ${durationStr}, defaulting to 120 minutes`);
  return 120;
}

// Parse opening intervals from CSV format to normalized format
export function parseOpeningIntervals(openingTimeStr: string): string[] {
  if (!openingTimeStr || openingTimeStr.trim() === '') {
    return ['09:00-17:00']; // Default 9 AM to 5 PM
  }

  const intervals: string[] = [];

  // Split by '&' for multiple time slots
  const timeSlots = openingTimeStr.split('&').map(slot => slot.trim());

  for (const slot of timeSlots) {
    // Extract start and end times
    const match = slot.match(/(.+?)\s*-\s*(.+)/);
    if (match) {
      const [, startTime, endTime] = match;
      const start24 = to_24h(startTime.trim());
      const end24 = to_24h(endTime.trim());
      intervals.push(`${start24}-${end24}`);
    }
  }

  return intervals.length > 0 ? intervals : ['09:00-17:00'];
}

// Parse CSV and prepare attraction objects
export function parseAttractionsCSV(csvPath: string): ParsedAttraction[] {
  try {
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const parsedData = Papa.parse<AttractionCSVData>(csvData, {
      header: true,
      skipEmptyLines: true
    });

    return parsedData.data.map(row => {
      const opening_intervals = parseOpeningIntervals(row['Opening_Time - Closing_Time']);
      const visit_minutes = duration_to_minutes(row.Visit_Duration);

      return {
        orig_id: row.A_id || '',
        name: row.Attraction || '',
        place: row.Place || '',
        opening_intervals,
        visit_minutes,
        latitude: parseFloat(row.latitude) || 0,
        longitude: parseFloat(row.longitude) || 0,
        themes: row.Travel_Theme || '',
        rating: row.Rating ? parseFloat(row.Rating) : undefined
      };
    }).filter(attraction =>
      attraction.orig_id &&
      attraction.name &&
      attraction.place &&
      attraction.latitude !== 0 &&
      attraction.longitude !== 0
    );
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

// Group attractions by destination
export function groupAttractionsByDestination(attractions: ParsedAttraction[]): Map<string, ParsedAttraction[]> {
  const grouped = new Map<string, ParsedAttraction[]>();

  for (const attraction of attractions) {
    const destination = attraction.place.toLowerCase().trim();
    if (!grouped.has(destination)) {
      grouped.set(destination, []);
    }
    grouped.get(destination)!.push(attraction);
  }

  return grouped;
}

// Meal timing constants
export const MEAL_RULES = {
  breakfast: {
    window: { start: '08:00', end: '09:30' },
    duration: { min: 30, max: 45 }
  },
  lunch: {
    window: { start: '13:00', end: '14:30' },
    duration: { min: 60, max: 60 }
  },
  dinner: {
    window: { start: '20:00', end: '21:30' },
    duration: { min: 60, max: 60 }
  }
};

export const BUFFER_MINUTES = {
  default: 90,
  min: 60,
  max: 180
};

// Removed API logging utilities - no longer needed

// Removed ranking API call implementation - no longer needed

// Removed ranking response parsing and retry logic - no longer needed

// Removed top-K selection logic - no longer needed

// Removed scheduling API call implementation - no longer needed

// Removed scheduling response parsing - no longer needed

// Removed validation functions - no longer needed

// Removed fallback scheduling functions - no longer needed

// Removed helper functions and retry logic - no longer needed

// Removed main TravelAI workflow function - no longer needed

// Removed convertToAPIFormat function - no longer needed