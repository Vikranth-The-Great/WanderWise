import { NextRequest, NextResponse } from 'next/server';

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = ['places.displayName', 'places.formattedAddress'].join(',');

interface GoogleSuggestionPlace {
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
}

interface GoogleSuggestionResponse {
  places?: GoogleSuggestionPlace[];
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(PLACES_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en'
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Destination suggestion search failed:', response.status, details);
      return NextResponse.json({ suggestions: [] });
    }

    const data = (await response.json()) as GoogleSuggestionResponse;
    const suggestions = Array.from(
      new Set(
        (data.places ?? [])
          .map((place) => {
            const name = place.displayName?.text?.trim();
            const address = place.formattedAddress?.trim();

            if (!name) {
              return null;
            }

            if (!address || address.toLowerCase() === name.toLowerCase()) {
              return name;
            }

            return `${name}, ${address}`;
          })
          .filter((value): value is string => Boolean(value))
      )
    ).slice(0, 10);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching destination suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
