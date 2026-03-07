import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * User preferences for generating an itinerary.
 * @property type_of_group - The type of traveler group (e.g., solo, couple, family).
 * @property destination - The target destination for the trip.
 * @property age - Average age of the travelers.
 * @property budget - Budget range (e.g., cheap, moderate, luxury).
 * @property themes - List of preferred travel themes (e.g., nature, historical).
 * @property days - Duration of the trip in days.
 */
export interface UserPreferences {
  type_of_group: string;
  destination: string;
  age: number;
  budget: string;
  themes: string[];
  days: number;
}

/**
 * Result of the AI workflow execution.
 * @property success - Whether the workflow completed successfully.
 * @property data - The generated itinerary data (optional).
 * @property error - Error message if execution failed (optional).
 * @property metadata - Execution metrics and logs.
 */
export interface WorkflowResult {
  success: boolean;
  data?: {
    schedule: any[];
    destination: string;
    days: number;
    rankedIds: string[];
    totalAttractions: number;
    scheduledAttractions: number;
  };
  error?: string;
  metadata: {
    rankingApiCalls: number;
    schedulingApiCalls: number;
    totalTokensUsed: number;
    validatedIds: string[];
    logs: Array<{
      step: string;
      success: boolean;
      timestamp: string;
      details?: any;
      error?: string;
    }>;
  };
}

/**
 * Executes the AI workflow to generate an itinerary based on user preferences.
 * Currently runs in MOCK MODE, generating a schedule from CSV data without calling external AI APIs.
 * 
 * @param userPreferences - The user's travel preferences.
 * @param csvPath - Optional path to the attractions CSV file (defaults to data/attractions-database.csv).
 * @returns A promise resolving to the WorkflowResult.
 */
export async function executeAIWorkflow(
  userPreferences: UserPreferences,
  csvPath?: string
): Promise<WorkflowResult> {
  const logs: any[] = [];
  let totalTokensUsed = 0;

  console.log('🚀 BACKEND PROCESS - AI Workflow Starting (MOCK MODE):', {
    destination: userPreferences.destination,
    days: userPreferences.days,
    travelerType: userPreferences.type_of_group,
    budget: userPreferences.budget,
    themes: userPreferences.themes,
    timestamp: new Date().toISOString()
  });

  try {
    // Step 1: Get attractions from CSV
    const actualCsvPath = csvPath || path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(actualCsvPath, 'utf-8');
    const attractions = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Filter attractions by destination
    const destinationAttractions = attractions.filter((attraction: any) => {
      const attractionDest = attraction.Place || attraction.destination || attraction.Destination || '';
      return attractionDest.toLowerCase().includes(userPreferences.destination.toLowerCase());
    });

    console.log(`Found ${destinationAttractions.length} attractions for ${userPreferences.destination}`);

    // Generate mock schedule
    const schedule = [];
    const attractionsPerDay = 4;
    let attractionIndex = 0;

    for (let day = 1; day <= userPreferences.days; day++) {
      const dayAttractions = [];

      // Add 4 attractions
      for (let i = 0; i < attractionsPerDay; i++) {
        // Cycle through attractions if we run out
        const attraction = destinationAttractions[attractionIndex % destinationAttractions.length] as any;
        if (attraction) {
          // Calculate time slots for attractions
          let timeSlot = "";
          if (i === 0) timeSlot = "07:30 AM";
          else if (i === 1) timeSlot = "10:30 AM";
          else if (i === 2) timeSlot = "03:00 PM";
          else if (i === 3) timeSlot = "05:00 PM";

          dayAttractions.push({
            id: attraction.A_id || attraction.id || attraction.ID || `mock-${day}-${i}`,
            name: attraction.Attraction || attraction.name || attraction.Name || 'Unknown Attraction',
            time: timeSlot,
            duration: "1.5 hours",
            description: attraction["Description & Backstory"] || attraction.description || "A wonderful place to visit.",
            type: "attraction",
            coordinates: {
              lat: parseFloat(attraction.latitude || "0"),
              lng: parseFloat(attraction.longitude || "0")
            }
          });
        }
        attractionIndex++;
      }

      schedule.push({
        day: day,
        breakfast: {
          time: "09:00 AM",
          name: "Breakfast at Local Cafe",
          description: "Start your day with a delicious breakfast."
        },
        lunch: {
          time: "01:00 PM",
          name: "Lunch at City Center",
          description: "Enjoy a hearty lunch at a popular local restaurant."
        },
        dinner: {
          time: "08:00 PM",
          name: "Dinner at Fine Dining",
          description: "End your day with an exquisite dinner experience."
        },
        attractions: dayAttractions
      });
    }

    return {
      success: true,
      data: {
        schedule: schedule,
        destination: userPreferences.destination,
        days: userPreferences.days,
        rankedIds: destinationAttractions.map((a: any) => a.A_id || a.id),
        totalAttractions: destinationAttractions.length,
        scheduledAttractions: attractionIndex
      },
      metadata: {
        rankingApiCalls: 0,
        schedulingApiCalls: 0,
        totalTokensUsed: 0,
        validatedIds: destinationAttractions.map((a: any) => a.A_id || a.id),
        logs: []
      }
    };

  } catch (error) {
    console.error('AI Workflow error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown workflow error',
      metadata: {
        rankingApiCalls: 0,
        schedulingApiCalls: 0,
        totalTokensUsed: 0,
        validatedIds: [],
        logs: []
      }
    };
  }
}

/**
 * Calls the ranking API to get a prioritized list of attraction IDs.
 * (Currently unused in the mock implementation but kept for future integration).
 * 
 * @param userPreferences - The user's travel preferences.
 * @param retries - Number of retry attempts for the API call (default: 3).
 * @returns The ranking result or error object.
 */
async function callRankingAPI(userPreferences: UserPreferences, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('http://localhost:3000/api/ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userPreferences)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Check if result is an array (success case) or error object
      if (Array.isArray(result)) {
        // Success case: ranking API returned array of IDs
        return {
          success: true,
          data: result
        };
      } else if (result && typeof result.success === 'boolean') {
        // Error case: ranking API returned error object
        if (!result.success && !result.error) {
          throw new Error('Ranking API returned failure without error message');
        }
        return result;
      } else {
        throw new Error('Invalid response format from ranking API');
      }

      return result;
    } catch (error) {
      console.error(`Ranking API attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        return {
          success: false,
          error: `Ranking API failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Calls the scheduling API to generate a daily schedule from ranked attractions.
 * (Currently unused in the mock implementation but kept for future integration).
 * 
 * @param schedulingRequest - Object containing ranked IDs, duration, and destination.
 * @param retries - Number of retry attempts (default: 3).
 * @returns The scheduling result or error object.
 */
async function callSchedulingAPI(schedulingRequest: {
  rankedIds: string[];
  days: number;
  destination: string;
}, retries = 3) {
  // Validate input
  if (!schedulingRequest.rankedIds || schedulingRequest.rankedIds.length === 0) {
    return {
      success: false,
      error: 'No ranked IDs provided for scheduling'
    };
  }

  if (!schedulingRequest.days || schedulingRequest.days <= 0) {
    return {
      success: false,
      error: 'Invalid number of days for scheduling'
    };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('http://localhost:3000/api/scheduling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(schedulingRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Validate response structure
      if (!result || typeof result.success !== 'boolean') {
        throw new Error('Invalid response format from scheduling API');
      }

      if (!result.success && !result.error) {
        throw new Error('Scheduling API returned failure without error message');
      }

      // Additional validation for successful responses
      if (result.success && result.data) {
        if (!result.data.schedule || !Array.isArray(result.data.schedule)) {
          throw new Error('Invalid schedule format in API response');
        }

        if (result.data.schedule.length !== schedulingRequest.days) {
          throw new Error(`Schedule contains ${result.data.schedule.length} days, expected ${schedulingRequest.days}`);
        }
      }

      return result;
    } catch (error) {
      console.error(`Scheduling API attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        return {
          success: false,
          error: `Scheduling API failed after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

async function validateAttractionIds(
  rankedIds: string[],
  destination: string,
  csvPath?: string
): Promise<string[]> {
  try {
    const actualCsvPath = csvPath || path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(actualCsvPath, 'utf-8');
    const attractions = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Filter attractions by destination and validate IDs
    const destinationAttractions = attractions.filter((attraction: any) => {
      const attractionDest = attraction.Place || attraction.destination || attraction.Destination || '';
      return attractionDest.toLowerCase().includes(destination.toLowerCase());
    });

    const validIds = rankedIds.filter(id =>
      destinationAttractions.some((attraction: any) =>
        (attraction.A_id || attraction.id || attraction.ID) === id
      )
    );
    return validIds;
  } catch (error) {
    console.error('Validation error:', error);
    return [];
  }
}

/**
 * Validates the structure of the generated schedule.
 * Checks for required fields (meals, attractions) and data types.
 * 
 * @param schedule - The schedule array to validate.
 * @param expectedDays - The expected number of days in the schedule.
 * @returns True if valid, false otherwise.
 */
function validateSchedule(schedule: any[], expectedDays: number): boolean {
  if (!schedule || !Array.isArray(schedule)) {
    console.error('Schedule validation failed: schedule is not an array');
    return false;
  }

  if (schedule.length !== expectedDays) {
    console.error(`Schedule validation failed: expected ${expectedDays} days, got ${schedule.length}`);
    return false;
  }

  for (let i = 0; i < schedule.length; i++) {
    const day = schedule[i];

    // Check day structure
    if (!day || typeof day !== 'object') {
      console.error(`Schedule validation failed: day ${i + 1} is not a valid object`);
      return false;
    }

    // Check that each day has required meals
    if (!day.breakfast || !day.breakfast.time) {
      console.error(`Schedule validation failed: day ${i + 1} missing valid breakfast`);
      return false;
    }

    if (!day.lunch || !day.lunch.time) {
      console.error(`Schedule validation failed: day ${i + 1} missing valid lunch`);
      return false;
    }

    if (!day.dinner || !day.dinner.time) {
      console.error(`Schedule validation failed: day ${i + 1} missing valid dinner`);
      return false;
    }

    // Check that each day has attractions
    if (!day.attractions || !Array.isArray(day.attractions) || day.attractions.length === 0) {
      console.error(`Schedule validation failed: day ${i + 1} has no valid attractions`);
      return false;
    }

    // Validate each attraction
    for (let j = 0; j < day.attractions.length; j++) {
      const attraction = day.attractions[j];
      if (!attraction.id || !attraction.name || !attraction.time) {
        console.error(`Schedule validation failed: day ${i + 1}, attraction ${j + 1} missing required fields`);
        return false;
      }
    }
  }

  return true;
}

/**
 * Converts the workflow result into the final itinerary format used by the frontend.
 * Organizes activities chronologically with meals interleaved.
 * 
 * @param workflowResult - The raw result from the workflow execution.
 * @returns The formatted itinerary object.
 */
export function convertToItineraryFormat(workflowResult: WorkflowResult) {
  if (!workflowResult.success || !workflowResult.data) {
    return {
      success: false,
      error: workflowResult.error,
      data: null
    };
  }

  const { schedule, destination, days } = workflowResult.data;

  const itinerary = schedule.map((day, index) => {
    // Explicitly order activities: Attraction 1, Breakfast, Attraction 2, Lunch, Attraction 3, Attraction 4, Dinner, Hotel
    const activities = [
      // Attraction 1 (Index 0)
      ...(day.attractions.length > 0 ? [{
        time: day.attractions[0].time,
        type: 'attraction',
        name: day.attractions[0].name,
        id: day.attractions[0].id,
        duration: day.attractions[0].duration
      }] : []),

      // Breakfast
      {
        time: day.breakfast.time,
        type: 'meal',
        name: day.breakfast.name,
        category: 'breakfast'
      },

      // Attraction 2 (Index 1)
      ...(day.attractions.length > 1 ? [{
        time: day.attractions[1].time,
        type: 'attraction',
        name: day.attractions[1].name,
        id: day.attractions[1].id,
        duration: day.attractions[1].duration
      }] : []),

      // Lunch
      {
        time: day.lunch.time,
        type: 'meal',
        name: day.lunch.name,
        category: 'lunch'
      },

      // Attraction 3 (Index 2)
      ...(day.attractions.length > 2 ? [{
        time: day.attractions[2].time,
        type: 'attraction',
        name: day.attractions[2].name,
        id: day.attractions[2].id,
        duration: day.attractions[2].duration
      }] : []),

      // Attraction 4 (Index 3)
      ...(day.attractions.length > 3 ? [{
        time: day.attractions[3].time,
        type: 'attraction',
        name: day.attractions[3].name,
        id: day.attractions[3].id,
        duration: day.attractions[3].duration
      }] : []),

      // Dinner
      {
        time: day.dinner.time,
        type: 'meal',
        name: day.dinner.name,
        category: 'dinner'
      },

      // Hotel
      ...(day.attractions.some((a: any) => a.type === 'accommodation' || a.category === 'accommodation') ? [] : [{
        time: day.hotel?.time || "10:00 PM",
        type: 'accommodation',
        name: day.hotel?.name || "Hotel",
        description: day.hotel?.description || "Rest and recharge.",
        category: 'accommodation'
      }])
    ];

    return {
      day: index + 1,
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activities: activities
    };
  });

  return {
    success: true,
    destination,
    duration: days,
    itinerary,
    metadata: {
      ...workflowResult.metadata,
      workflowSuccess: true
    }
  };
}