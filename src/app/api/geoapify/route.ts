import { NextRequest, NextResponse } from 'next/server';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';
const BASE_URL = 'https://api.geoapify.com/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const waypoints = searchParams.get('waypoints');
    const mode = searchParams.get('mode') || 'drive';
    const query = searchParams.get('query') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '1500';
    const categories = searchParams.get('categories');
    const text = searchParams.get('text');

    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: 'Geoapify API key not configured' },
        { status: 500 }
      );
    }

    let apiUrl = '';

    switch (endpoint) {
      case 'routing':
        if (!waypoints) {
          return NextResponse.json(
            { error: 'Waypoints parameter is required for routing' },
            { status: 400 }
          );
        }
        apiUrl = `${BASE_URL}/routing?waypoints=${waypoints}&mode=${mode}&apiKey=${GEOAPIFY_API_KEY}`;
        break;

      case 'places':
        if (!lat || !lng) {
          return NextResponse.json(
            { error: 'Latitude and longitude are required for places search' },
            { status: 400 }
          );
        }
        const categoriesParam = categories ? `&categories=${categories}` : '';
        apiUrl = `${BASE_URL}/places?filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=20${categoriesParam}&apiKey=${GEOAPIFY_API_KEY}`;
        break;

      case 'geocode':
        if (!text) {
          return NextResponse.json(
            { error: 'Text parameter is required for geocoding' },
            { status: 400 }
          );
        }
        apiUrl = `${BASE_URL}/geocode/search?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid endpoint specified' },
          { status: 400 }
        );
    }

    console.log('Proxying request to:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Geoapify API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in Geoapify proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'POST method not supported' },
    { status: 405 }
  );
}