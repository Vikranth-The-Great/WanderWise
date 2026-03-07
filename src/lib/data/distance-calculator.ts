// Distance calculator utility using Pairwise.csv data
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface DistanceData {
  Place: string;
  Attraction1: string;
  Attraction2: string;
  Distance_km: string;
}

interface DistanceMap {
  [key: string]: number;
}

let distanceCache: DistanceMap | null = null;

// Load and parse the Pairwise.csv file
/**
 * Loads the pairwise distance data from CSV into a memory cache.
 * Key format: "Attraction1|Attraction2"
 * @returns Map of attraction pairs to distances in km.
 */
export function loadDistanceData(): DistanceMap {
  if (distanceCache) {
    return distanceCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'pairwise-distances.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const parsed = Papa.parse<DistanceData>(csvContent, {
      header: true,
      skipEmptyLines: true
    });

    const distanceMap: DistanceMap = {};

    parsed.data.forEach(row => {
      if (row.Attraction1 && row.Attraction2 && row.Distance_km) {
        const key1 = `${row.Attraction1}|${row.Attraction2}`;
        const key2 = `${row.Attraction2}|${row.Attraction1}`;
        const distance = parseFloat(row.Distance_km);

        distanceMap[key1] = distance;
        distanceMap[key2] = distance; // Bidirectional
      }
    });

    distanceCache = distanceMap;
    return distanceMap;
  } catch (error) {
    console.error('Error loading distance data:', error);
    return {};
  }
}

// Get distance between two attractions
/**
 * Gets the pre-calculated distance between two named attractions.
 * @param attraction1 - Name of the first attraction.
 * @param attraction2 - Name of the second attraction.
 * @returns Distance in km, or 0 if not found.
 */
export function getDistanceBetweenAttractions(attraction1: string, attraction2: string): number {
  const distanceMap = loadDistanceData();
  const key = `${attraction1}|${attraction2}`;

  return distanceMap[key] || 0; // Return 0 if no distance data found
}

// Calculate total travel distance for a sequence of attractions
export function calculateTotalTravelDistance(attractions: string[]): number {
  if (attractions.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < attractions.length - 1; i++) {
    totalDistance += getDistanceBetweenAttractions(attractions[i], attractions[i + 1]);
  }

  return totalDistance;
}

// Find the nearest attraction from a list of candidates
export function findNearestAttraction(currentAttraction: string, candidates: string[]): string | null {
  if (candidates.length === 0) return null;

  let nearestAttraction = candidates[0];
  let minDistance = getDistanceBetweenAttractions(currentAttraction, nearestAttraction);

  for (let i = 1; i < candidates.length; i++) {
    const distance = getDistanceBetweenAttractions(currentAttraction, candidates[i]);
    if (distance > 0 && (minDistance === 0 || distance < minDistance)) {
      minDistance = distance;
      nearestAttraction = candidates[i];
    }
  }

  return nearestAttraction;
}

// Optimize attraction order using nearest neighbor algorithm
/**
 * Reorders a list of attractions to minimize total travel distance using a greedy nearest-neighbor approach.
 * @param attractions - List of attraction names.
 * @returns Optimized list of attraction names.
 */
export function optimizeAttractionOrder(attractions: string[]): string[] {
  if (attractions.length <= 1) return attractions;

  const optimized: string[] = [];
  const remaining = [...attractions];

  // Start with the first attraction
  optimized.push(remaining.shift()!);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    const nearest = findNearestAttraction(current, remaining);

    if (nearest) {
      optimized.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
    } else {
      // If no distance data available, just add the next one
      optimized.push(remaining.shift()!);
    }
  }

  return optimized;
}

// Calculate estimated travel time based on distance (assuming average speed)
export function estimateTravelTime(distanceKm: number, averageSpeedKmh: number = 30): number {
  // Returns travel time in minutes
  return Math.round((distanceKm / averageSpeedKmh) * 60);
}

// Check if travel distance between attractions is reasonable for same day
export function isReasonableDayDistance(attraction1: string, attraction2: string, maxDayDistanceKm: number = 50): boolean {
  const distance = getDistanceBetweenAttractions(attraction1, attraction2);
  return distance <= maxDayDistanceKm;
}