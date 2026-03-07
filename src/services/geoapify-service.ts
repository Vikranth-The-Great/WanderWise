interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distance: number; // in meters
  duration: number; // in seconds
}

interface GeoapifyResponse {
  features: Array<{
    properties: {
      distance: number;
      time: number;
    };
  }>;
}

/**
 * Service wrapper for Geoapify API.
 * Handles distance calculation and integration with external mapping service.
 */
export class GeoapifyService {
  private apiKey: string;
  private baseUrl = 'https://api.geoapify.com/v1/routing';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Geoapify API key not found. Distance calculations will use fallback estimates.');
    }
  }

  /**
   * Calculate distance and travel time between two points
   */
  /**
   * Calculate distance and travel time between two points using the routing API.
   * Falls back to Haversine formula if API key is missing or call fails.
   * 
   * @param from - Start coordinates.
   * @param to - End coordinates.
   * @param mode - Travel mode (walk, drive, transit).
   * @returns Distance in meters and duration in seconds.
   */
  async calculateDistance(
    from: Coordinates,
    to: Coordinates,
    mode: 'walk' | 'drive' | 'transit' = 'walk'
  ): Promise<DistanceResult> {
    if (!this.apiKey) {
      // Fallback: Use Haversine formula for distance estimation
      const distance = this.calculateHaversineDistance(from, to);
      const duration = this.estimateTravelTime(distance, mode);
      return { distance, duration };
    }

    try {
      const url = `${this.baseUrl}?waypoints=${from.lat},${from.lng}|${to.lat},${to.lng}&mode=${mode}&apiKey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
      }

      const data: GeoapifyResponse = await response.json();

      if (data.features && data.features.length > 0) {
        const route = data.features[0].properties;
        return {
          distance: route.distance,
          duration: route.time
        };
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('Error calculating distance with Geoapify:', error);
      // Fallback to Haversine calculation
      const distance = this.calculateHaversineDistance(from, to);
      const duration = this.estimateTravelTime(distance, mode);
      return { distance, duration };
    }
  }

  /**
   * Calculate distances from one point to multiple destinations
   */
  async calculateDistancesToMultiple(
    from: Coordinates,
    destinations: Coordinates[],
    mode: 'walk' | 'drive' | 'transit' = 'walk'
  ): Promise<DistanceResult[]> {
    const promises = destinations.map(dest =>
      this.calculateDistance(from, dest, mode)
    );

    return Promise.all(promises);
  }

  /**
   * Haversine formula for calculating distance between two points on Earth
   */
  private calculateHaversineDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = from.lat * Math.PI / 180;
    const φ2 = to.lat * Math.PI / 180;
    const Δφ = (to.lat - from.lat) * Math.PI / 180;
    const Δλ = (to.lng - from.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Estimate travel time based on distance and mode
   */
  private estimateTravelTime(distance: number, mode: 'walk' | 'drive' | 'transit'): number {
    // Average speeds in m/s
    const speeds = {
      walk: 1.4,    // ~5 km/h
      drive: 8.33,  // ~30 km/h (city driving)
      transit: 5.56 // ~20 km/h (including stops)
    };

    return distance / speeds[mode]; // Time in seconds
  }

  /**
   * Format duration from seconds to human readable format
   */
  formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  /**
   * Format distance from meters to human readable format
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    const km = (meters / 1000).toFixed(1);
    return `${km}km`;
  }
}

export const geoapifyService = new GeoapifyService();