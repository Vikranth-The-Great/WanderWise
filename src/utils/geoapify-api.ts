// Geoapify API configuration and utilities

// Use our internal API proxy instead of direct calls
const BASE_URL = '/api/geoapify';

// Interface for location coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interface for place details
export interface PlaceDetails {
  name: string;
  address: string;
  coordinates: Coordinates;
  placeId?: string;
  category?: string;
  rating?: number;
  website?: string;
  phone?: string;
}

// Interface for geocoding response
export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
    postcode?: string;
  };
}

// Interface for places search response
export interface PlacesSearchResult {
  features: Array<{
    properties: {
      name: string;
      formatted: string;
      lat: number;
      lon: number;
      place_id: string;
      categories: string[];
      datasource: {
        sourcename: string;
        attribution: string;
      };
    };
  }>;
}

// Geocode an address to get coordinates
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `${BASE_URL}?endpoint=geocode&text=${encodeURIComponent(address)}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

// Reverse geocode coordinates to get address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

// Search for places near a location
export async function searchPlaces(
  query: string,
  coordinates: Coordinates,
  radius: number = 1500,
  categories: string[] = ['catering.restaurant']
): Promise<PlaceDetails[]> {
  try {
    const categoriesParam = categories.length > 0 ? `&categories=${categories.join(',')}` : '';
    
    const response = await fetch(
      `${BASE_URL}?endpoint=places&lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}${categoriesParam}`
    );
    
    if (!response.ok) {
      throw new Error(`Places search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => {
        const properties = feature.properties;
        const [lng, lat] = feature.geometry.coordinates;
        
        return {
          name: properties.name || properties.formatted || 'Unknown Place',
          address: properties.formatted || properties.address_line1 || '',
          coordinates: { lat, lng },
          placeId: properties.place_id,
          category: properties.categories?.[0] || '',
          rating: properties.rating,
          website: properties.website,
          phone: properties.contact?.phone
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

// Get route between two points
export async function getRoute(
  start: Coordinates,
  end: Coordinates,
  mode: 'drive' | 'walk' | 'bike' = 'drive'
): Promise<{
  distance: number;
  duration: number;
  coordinates: Coordinates[];
  geometry?: any;
} | null> {
  try {
    const waypoints = `${start.lat},${start.lng}|${end.lat},${end.lng}`;
    const response = await fetch(
      `${BASE_URL}?endpoint=routing&waypoints=${waypoints}&mode=${mode}`
    );
    
    if (!response.ok) {
      throw new Error(`Routing failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const route = data.features[0];
      const geometry = route.geometry.coordinates[0];
      
      return {
        distance: route.properties.distance,
        duration: route.properties.time,
        geometry: route.geometry,
        coordinates: geometry.map((coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0]
        }))
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
}

// Get places along a route
export async function getPlacesAlongRoute(
  route: Coordinates[],
  categories: string[] = PLACE_CATEGORIES.RESTAURANTS,
  _maxDetour: number = 1000
): Promise<PlaceDetails[]> {
  try {
    // Convert route to a line string for the API
    const routeString = route.map(coord => `${coord.lng},${coord.lat}`).join('|');
    
    const response = await fetch(
      `${BASE_URL}/places?categories=${categories.join(',')}&filter=route:${routeString}&bias=proximity:${routeString}&apiKey=${GEOAPIFY_API_KEY}&limit=20`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geoapify API Error:', response.status, response.statusText, errorText);
      throw new Error(`Places along route search failed: ${response.statusText}`);
    }
    
    const data: PlacesSearchResult = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map(feature => ({
      name: feature.properties.name || 'Unknown',
      address: feature.properties.formatted || 'Unknown address',
      coordinates: {
        lat: feature.properties.lat,
        lng: feature.properties.lon
      },
      placeId: feature.properties.place_id,
      category: feature.properties.categories?.[0] || 'unknown'
    }));
  } catch (error) {
    console.error('Error searching places along route:', error);
    throw error;
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Return distance in meters
}

// Validate API key
export function validateGeoapifyApiKey(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  return !!(apiKey && apiKey.trim() !== '');
}

// Common place categories for search
export const PLACE_CATEGORIES = {
  RESTAURANTS: ['catering.restaurant', 'catering.fast_food'],
  ATTRACTIONS: ['tourism.attraction', 'entertainment'],
  ACCOMMODATION: ['accommodation.hotel', 'accommodation'],
  TRANSPORT: ['public_transport.station'],
  SHOPPING: ['commercial.supermarket', 'commercial.shopping_mall'],
  NIGHTLIFE: ['catering.pub', 'entertainment.nightclub']
};