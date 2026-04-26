import OpenAI from 'openai';

import {
  GeneratedItinerary,
  ItineraryActivity,
  ItineraryDay,
  PlaceResult,
  UserTripPreferences
} from '../types/itinerary';

const OUTPUT_SCHEMA = {
  destination: 'string',
  totalDays: 'number',
  itinerary: [
    {
      day: 'number',
      date: 'string',
      activities: [
        {
          time: 'string',
          type: 'attraction | meal | accommodation | transport',
          name: 'string',
          description: 'string',
          address: 'string',
          coordinates: { lat: 'number', lng: 'number' },
          rating: 'number?',
          placeId: 'string?'
        }
      ]
    }
  ]
};

const SYSTEM_PROMPT = `You are a professional travel planner. You will receive:
1. A list of real places with names, addresses, and ratings
2. User travel preferences

Your job is to create a logical, day-by-day itinerary by selecting and ordering these places.

Rules:
- Each day must start between 8-9 AM and end by 10 PM
- Include breakfast, lunch, and dinner slots
- Space activities with realistic travel time
- Match the budget level in recommendations
- Output ONLY valid JSON matching the provided schema - no extra text`;

export async function generateItinerary(
  prefs: UserTripPreferences,
  places: PlaceResult[],
  retries = 1
): Promise<GeneratedItinerary> {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            `Preferences: ${JSON.stringify(prefs)}`,
            `Available Places: ${JSON.stringify(places)}`,
            `Required Output Schema: ${JSON.stringify(OUTPUT_SCHEMA)}`
          ].join('\n')
        }
      ]
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI returned an empty itinerary response');
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('OpenAI returned invalid JSON');
    }

    if (!isGeneratedItinerary(parsed)) {
      throw new Error('OpenAI returned JSON that does not match the itinerary schema');
    }

    return parsed;
  } catch (error: unknown) {
    const isRateLimitError = (err: unknown): err is { status: number } => 
      typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 429;

    if (isRateLimitError(error)) {
      throw new Error('AI service is currently busy (Rate Limited). Please try again in a few moments.');
    }
    
    if (retries > 0) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`OpenAI call failed (${message}). Retrying...`);
      return generateItinerary(prefs, places, retries - 1);
    }
    
    throw error;
  }
}

function isGeneratedItinerary(value: unknown): value is GeneratedItinerary {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.destination === 'string'
    && typeof value.totalDays === 'number'
    && Array.isArray(value.itinerary)
    && value.itinerary.every(isItineraryDay);
}

function isItineraryDay(value: unknown): value is ItineraryDay {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.day === 'number'
    && typeof value.date === 'string'
    && Array.isArray(value.activities)
    && value.activities.every(isItineraryActivity);
}

function isItineraryActivity(value: unknown): value is ItineraryActivity {
  if (!isRecord(value) || !isCoordinates(value.coordinates)) {
    return false;
  }

  return typeof value.time === 'string'
    && typeof value.type === 'string'
    && typeof value.name === 'string'
    && typeof value.description === 'string'
    && typeof value.address === 'string'
    && (value.rating === undefined || typeof value.rating === 'number')
    && (value.placeId === undefined || typeof value.placeId === 'string');
}

function isCoordinates(value: unknown): value is { lat: number; lng: number } {
  return isRecord(value) && typeof value.lat === 'number' && typeof value.lng === 'number';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  return new OpenAI({ apiKey });
}