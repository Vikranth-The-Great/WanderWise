import { PlaceResult, UserTripPreferences } from '../types/itinerary';

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.primaryType'
].join(',');

interface GooglePlacesTextSearchRequest {
  textQuery: string;
  languageCode: 'en';
}

interface GooglePlaceLocation {
  latitude?: number;
  longitude?: number;
}

interface GooglePlaceDisplayName {
  text?: string;
}

interface GooglePlace {
  id?: string;
  displayName?: GooglePlaceDisplayName;
  formattedAddress?: string;
  location?: GooglePlaceLocation;
  rating?: number;
  primaryType?: string;
}

interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const cleanedQuery = query.trim();

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is missing');
  }

  if (!cleanedQuery) {
    return [];
  }

  const response = await fetch(PLACES_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK
    },
    body: JSON.stringify({
      textQuery: cleanedQuery,
      languageCode: 'en'
    } satisfies GooglePlacesTextSearchRequest)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Places request failed (${response.status}): ${errorBody || response.statusText}`);
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;
  return normalizePlaces(data.places ?? []);
}

export async function fetchPlacesForTrip(prefs: UserTripPreferences): Promise<PlaceResult[]> {
  const destination = prefs.destination.trim();
  const budget = prefs.budget.trim();
  const destinationMatches = await searchPlaces(destination);

  if (!isLikelyDestinationMatch(destination, destinationMatches)) {
    return [];
  }

  const [attractions, restaurants, hotels] = await Promise.all([
    searchPlaces(`top tourist attractions in ${destination}`),
    searchPlaces(`best ${budget} restaurants in ${destination}`),
    searchPlaces(`best ${budget} hotels in ${destination}`)
  ]);

  return dedupePlaces([...attractions, ...restaurants, ...hotels]).slice(0, 18);
}

function normalizePlaces(places: GooglePlace[]): PlaceResult[] {
  const normalizedPlaces = places.flatMap((place, index) => {
      const latitude = place.location?.latitude;
      const longitude = place.location?.longitude;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return [];
      }

      return [{
        placeId: place.id || `google-place-${index}`,
        name: place.displayName?.text || 'Unknown place',
        address: place.formattedAddress || '',
        coordinates: {
          lat: latitude,
          lng: longitude
        },
        rating: typeof place.rating === 'number' ? place.rating : undefined,
        primaryType: place.primaryType
      } satisfies PlaceResult];
    });

  return normalizedPlaces as PlaceResult[];
}

function dedupePlaces(places: PlaceResult[]): PlaceResult[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = place.placeId || `${place.name.toLowerCase()}::${place.address.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isLikelyDestinationMatch(destination: string, matches: PlaceResult[]): boolean {
  if (matches.length === 0) {
    return false;
  }

  const strongTokens = extractStrongDestinationTokens(destination);
  if (strongTokens.length === 0) {
    return true;
  }

  return matches.slice(0, 5).some((match) => {
    const haystack = `${match.name} ${match.address}`.toLowerCase();
    return strongTokens.some((token) => haystack.includes(token));
  });
}

function extractStrongDestinationTokens(destination: string): string[] {
  const stopWords = new Set([
    'north',
    'south',
    'east',
    'west',
    'city',
    'town',
    'village',
    'island',
    'beach',
    'mount',
    'mountain',
    'fort',
    'district',
    'state',
    'province',
    'region',
    'country',
    'unknown'
  ]);

  return Array.from(
    new Set(
      destination
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4 && !stopWords.has(token))
        .sort((left, right) => right.length - left.length)
        .slice(0, 2)
    )
  );
}
