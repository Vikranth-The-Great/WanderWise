import { NextRequest, NextResponse } from 'next/server';

import { fetchPlacesForTrip } from '@/services/google-places';
import { generateItinerary } from '@/services/openai-itinerary';
import { GeneratedItinerary, UserTripPreferences } from '@/types/itinerary';

function isUserTripPreferences(value: unknown): value is UserTripPreferences {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prefs = value as Record<string, unknown>;
  const travelerTypes = new Set(['solo', 'couple', 'family', 'friends']);
  const budgetLevels = new Set(['cheap', 'moderate', 'luxury']);

  return typeof prefs.destination === 'string'
    && prefs.destination.trim().length > 0
    && typeof prefs.days === 'number'
    && Number.isInteger(prefs.days)
    && prefs.days > 0
    && typeof prefs.travelerType === 'string'
    && travelerTypes.has(prefs.travelerType)
    && typeof prefs.budget === 'string'
    && budgetLevels.has(prefs.budget)
    && Array.isArray(prefs.themes)
    && prefs.themes.length > 0
    && prefs.themes.every((theme) => typeof theme === 'string');
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  if (!isUserTripPreferences(body)) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields' },
      { status: 400 }
    );
  }

  try {
    const places = await fetchPlacesForTrip(body);

    if (places.length === 0) {
      return NextResponse.json(
        { error: 'No places found for this destination' },
        { status: 404 }
      );
    }

    const itinerary = await generateItinerary(body, places);

    return NextResponse.json<GeneratedItinerary>(itinerary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('Rate Limited')) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    if (message.includes('place')) {
      return NextResponse.json(
        { error: 'Failed to fetch place data' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
