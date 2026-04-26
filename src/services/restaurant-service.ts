import { Coordinates, PlaceDetails, searchPlaces, getRoute } from '@/lib/api/geoapify';

/**
 * Restaurant data interface.
 */
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  category: string;
  rating?: number;
  distance?: number;
  type: 'nearby' | 'route';
}

/**
 * Options for restaurant search.
 */
export interface RestaurantSearchOptions {
  radius?: number; // in meters, default 1500 (1.5km)
  maxResults?: number;
  categories?: string[];
}

/**
 * Fetch restaurants within a specified radius of an attraction
 */
/**
 * Fetch restaurants within a specified radius of an attraction.
 * 
 * @param attractionCoordinates - Center point for search.
 * @param options - Search options (radius, limit, categories).
 * @returns List of found restaurants.
 */
export async function getRestaurantsNearAttraction(
  attractionCoordinates: Coordinates,
  options: RestaurantSearchOptions = {}
): Promise<Restaurant[]> {
  const {
    radius = 1500, // 1.5km default
    maxResults = 10,
    categories = ['catering.restaurant', 'catering.fast_food']
  } = options;

  try {
    const places = await searchPlaces(
      '', // empty query to get all restaurants
      attractionCoordinates,
      radius,
      categories
    );

    return places.slice(0, maxResults).map((place, index) => ({
      id: place.placeId || `nearby-${index}`,
      name: place.name,
      address: place.address,
      coordinates: place.coordinates,
      category: place.category || 'catering.restaurant',
      rating: place.rating,
      distance: calculateDistance(attractionCoordinates, place.coordinates),
      type: 'nearby' as const
    }));
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    return [];
  }
}

/**
 * Fetch restaurants along the route between two attractions
 */
/**
 * Fetch restaurants along the route between two attractions.
 * useful for finding lunch stops during travel.
 * 
 * @param startCoordinates - Route start point.
 * @param endCoordinates - Route end point.
 * @param options - Search options.
 * @returns List of restaurants near the route.
 */
export async function getRestaurantsAlongRoute(
  startCoordinates: Coordinates,
  endCoordinates: Coordinates,
  options: RestaurantSearchOptions = {}
): Promise<Restaurant[]> {
  const {
    radius = 500, // smaller radius for route restaurants
    maxResults = 8,
    categories = ['catering.restaurant', 'catering.fast_food']
  } = options;

  try {
    // Get the route between the two points
    const route = await getRoute(startCoordinates, endCoordinates, 'drive');

    if (!route || !route.geometry) {
      console.warn('Could not get route between attractions');
      return [];
    }

    // Extract waypoints along the route (simplified approach)
    const routeCoordinates = extractRouteWaypoints(route.geometry);

    // Search for restaurants near the midpoint and other key points along the route
    const searchPromises = routeCoordinates.map(coord =>
      searchPlaces('', coord, radius, categories)
    );

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    // Remove duplicates based on place ID or coordinates
    const uniqueRestaurants = removeDuplicateRestaurants(flatResults);

    return uniqueRestaurants.slice(0, maxResults).map((place, index) => ({
      id: place.placeId || `route-${index}`,
      name: place.name,
      address: place.address,
      coordinates: place.coordinates,
      category: place.category || 'catering.restaurant',
      rating: place.rating,
      distance: Math.min(
        calculateDistance(startCoordinates, place.coordinates),
        calculateDistance(endCoordinates, place.coordinates)
      ),
      type: 'route' as const
    }));
  } catch (error) {
    console.error('Error fetching route restaurants:', error);
    return [];
  }
}

/**
 * Get both nearby and route restaurants for a meal slot
 */
/**
 * Get both nearby and route restaurants for a meal slot.
 * Concurrently fetches restaurants near current location and along route to next location.
 * 
 * @param currentAttractionCoordinates - Current location.
 * @param nextAttractionCoordinates - Next location (optional).
 * @param options - Search options.
 * @returns Object containing nearby and route-based restaurants.
 */
export async function getRestaurantsForMealSlot(
  currentAttractionCoordinates: Coordinates,
  nextAttractionCoordinates?: Coordinates,
  options: RestaurantSearchOptions = {}
): Promise<{ nearby: Restaurant[]; route: Restaurant[] }> {
  const nearbyPromise = getRestaurantsNearAttraction(currentAttractionCoordinates, options);

  const routePromise = nextAttractionCoordinates
    ? getRestaurantsAlongRoute(currentAttractionCoordinates, nextAttractionCoordinates, options)
    : Promise.resolve([]);

  const [nearby, route] = await Promise.all([nearbyPromise, routePromise]);

  return { nearby, route };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Extract waypoints from route geometry (simplified)
 */
function extractRouteWaypoints(geometry: { coordinates: unknown }): Coordinates[] {
  if (!geometry || !geometry.coordinates) {
    return [];
  }

  // Handle both LineString (number[][]) and MultiLineString (number[][][])
  let coordsArray = geometry.coordinates as unknown[];
  if (coordsArray.length > 0 && Array.isArray(coordsArray[0]) && Array.isArray(coordsArray[0][0])) {
    coordsArray = coordsArray[0] as unknown[]; // Take first line string
  }
  
  const coordinates = coordsArray as number[][];
  const waypoints: Coordinates[] = [];

  // Take every 10th point to avoid too many API calls
  for (let i = 0; i < coordinates.length; i += Math.max(1, Math.floor(coordinates.length / 5))) {
    const [lng, lat] = coordinates[i];
    waypoints.push({ lat, lng });
  }

  return waypoints;
}

/**
 * Remove duplicate restaurants based on coordinates proximity
 */
function removeDuplicateRestaurants(restaurants: PlaceDetails[]): PlaceDetails[] {
  const unique: PlaceDetails[] = [];
  const threshold = 0.001; // ~100 meters

  for (const restaurant of restaurants) {
    const isDuplicate = unique.some(existing =>
      Math.abs(existing.coordinates.lat - restaurant.coordinates.lat) < threshold &&
      Math.abs(existing.coordinates.lng - restaurant.coordinates.lng) < threshold
    );

    if (!isDuplicate) {
      unique.push(restaurant);
    }
  }

  return unique;
}

/**
 * Get a default restaurant suggestion for a meal slot
 */
export async function getDefaultRestaurant(
  coordinates: Coordinates,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): Promise<Restaurant | null> {
  const categories = mealType === 'breakfast'
    ? ['catering.restaurant', 'catering.fast_food']
    : ['catering.restaurant', 'catering.fast_food'];

  const restaurants = await getRestaurantsNearAttraction(coordinates, {
    radius: 1500,
    maxResults: 1,
    categories
  });

  return restaurants.length > 0 ? restaurants[0] : null;
}