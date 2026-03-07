import { Activity } from '@/app/itinerary-results/page';
import { Coordinates } from '@/lib/api/geoapify';
import { getDefaultRestaurant } from '@/services/restaurant-service';

export interface MealSlot {
  type: 'breakfast' | 'lunch' | 'dinner';
  timeRange: {
    start: string; // Start of valid meal window (HH:MM)
    end: string;   // End of valid meal window (HH:MM)
  };
  duration: number; // Avg duration in minutes
  preferredTime: string; // Optimal time for this meal (HH:MM)
}

export interface MealActivity extends Activity {
  type: 'meal';
  mealType: 'breakfast' | 'lunch' | 'dinner';
  restaurantId?: string;
  isDefault: boolean;
}

// Define meal time slots
export const MEAL_SLOTS: Record<string, MealSlot> = {
  breakfast: {
    type: 'breakfast',
    timeRange: { start: '08:00', end: '09:30' },
    duration: 60,
    preferredTime: '08:30'
  },
  lunch: {
    type: 'lunch',
    timeRange: { start: '13:00', end: '14:30' },
    duration: 60,
    preferredTime: '13:30'
  },
  dinner: {
    type: 'dinner',
    timeRange: { start: '19:30', end: '20:30' },
    duration: 60,
    preferredTime: '20:00'
  }
};

/**
 * Insert meal slots into a day's activities based on attraction timings
 */
/**
 * Inserts meal slots (breakfast, lunch, dinner) into a day's list of activities.
 * Analyzes gaps between attraction visits to place meals at optimal or preferred times.
 * 
 * @param activities - The list of existing activities (attractions).
 * @param dayDate - The date of the day being scheduled.
 * @returns A new list of activities with meal slots interleaved.
 */
export async function insertMealSlots(
  activities: Activity[],
  dayDate: string
): Promise<Activity[]> {
  const activitiesWithMeals: Activity[] = [];
  const attractionActivities = activities.filter(a => a.type === 'attraction');

  if (attractionActivities.length === 0) {
    return activities;
  }

  // Sort attractions by time
  const sortedAttractions = attractionActivities.sort((a, b) =>
    timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  let currentIndex = 0;

  for (const attraction of sortedAttractions) {
    const attractionTime = timeToMinutes(attraction.time);

    // Check if we need to insert breakfast before this attraction
    if (currentIndex === 0) {
      const breakfastSlot = findOptimalMealTime('breakfast', attractionTime);
      if (breakfastSlot) {
        const breakfastActivity = await createMealActivity(
          'breakfast',
          breakfastSlot,
          dayDate,
          attraction.coordinates
        );
        activitiesWithMeals.push(breakfastActivity);
      }
    }

    // Add the attraction
    activitiesWithMeals.push(attraction);

    // Check if we need to insert lunch after this attraction
    const nextAttraction = sortedAttractions[currentIndex + 1];
    if (nextAttraction) {
      const nextAttractionTime = timeToMinutes(nextAttraction.time);
      const lunchSlot = findOptimalMealTime('lunch', attractionTime, nextAttractionTime);

      if (lunchSlot) {
        const lunchActivity = await createMealActivity(
          'lunch',
          lunchSlot,
          dayDate,
          attraction.coordinates,
          nextAttraction.coordinates
        );
        activitiesWithMeals.push(lunchActivity);
      }
    }

    // Check if we need to insert dinner after the last attraction
    if (currentIndex === sortedAttractions.length - 1) {
      const dinnerSlot = findOptimalMealTime('dinner', attractionTime);
      if (dinnerSlot) {
        const dinnerActivity = await createMealActivity(
          'dinner',
          dinnerSlot,
          dayDate,
          attraction.coordinates
        );
        activitiesWithMeals.push(dinnerActivity);
      }
    }

    currentIndex++;
  }

  // Add any non-attraction activities (transport, accommodation)
  const otherActivities = activities.filter(a => a.type !== 'attraction');
  activitiesWithMeals.push(...otherActivities);

  // Sort all activities by time
  return activitiesWithMeals.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

/**
 * Find optimal meal time based on attraction timings
 */
function findOptimalMealTime(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  currentAttractionTime: number,
  nextAttractionTime?: number
): string | null {
  const mealSlot = MEAL_SLOTS[mealType];
  const mealStartTime = timeToMinutes(mealSlot.timeRange.start);
  const mealEndTime = timeToMinutes(mealSlot.timeRange.end);
  const preferredTime = timeToMinutes(mealSlot.preferredTime);

  // For breakfast, schedule before first attraction if possible
  if (mealType === 'breakfast') {
    if (currentAttractionTime > mealEndTime + 30) { // 30 min buffer
      return mealSlot.preferredTime;
    }
    return null;
  }

  // For lunch, schedule between attractions
  if (mealType === 'lunch' && nextAttractionTime) {
    const gapStart = currentAttractionTime + 120; // 2 hours after current attraction
    const gapEnd = nextAttractionTime - 60; // 1 hour before next attraction

    // Check if preferred time fits in the gap
    if (preferredTime >= gapStart && preferredTime + mealSlot.duration <= gapEnd) {
      return mealSlot.preferredTime;
    }

    // Find best available time in the gap
    if (gapEnd - gapStart >= mealSlot.duration) {
      const optimalTime = Math.max(gapStart, mealStartTime);
      if (optimalTime + mealSlot.duration <= Math.min(gapEnd, mealEndTime)) {
        return minutesToTime(optimalTime);
      }
    }

    return null;
  }

  // For dinner, schedule after last attraction
  if (mealType === 'dinner') {
    const dinnerTime = Math.max(currentAttractionTime + 120, mealStartTime);
    if (dinnerTime <= mealEndTime) {
      return minutesToTime(dinnerTime);
    }
  }

  return null;
}

/**
 * Create a meal activity with default restaurant
 */
async function createMealActivity(
  mealType: 'breakfast' | 'lunch' | 'dinner',
  time: string,
  date: string,
  currentCoordinates?: Coordinates,
  _nextCoordinates?: Coordinates
): Promise<MealActivity> {
  const mealSlot = MEAL_SLOTS[mealType];
  let defaultRestaurant = null;

  if (currentCoordinates) {
    defaultRestaurant = await getDefaultRestaurant(currentCoordinates, mealType);
  }

  return {
    id: defaultRestaurant?.id || `${mealType}-${Date.now()}`,
    time,
    title: defaultRestaurant?.name || `${capitalizeFirst(mealType)} Restaurant`,
    location: defaultRestaurant?.address || 'Restaurant nearby',
    description: `Enjoy ${mealType} at a local restaurant`,
    duration: `${mealSlot.duration} mins`,
    cost: mealType === 'breakfast' ? '$10-20' : mealType === 'lunch' ? '$15-30' : '$25-50',
    type: 'meal',
    mealType,
    restaurantId: defaultRestaurant?.id,
    isDefault: true,
    coordinates: defaultRestaurant?.coordinates || currentCoordinates
  };
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if a time falls within a meal slot range
 */
export function isTimeInMealSlot(time: string, mealType: 'breakfast' | 'lunch' | 'dinner'): boolean {
  const timeMinutes = timeToMinutes(time);
  const mealSlot = MEAL_SLOTS[mealType];
  const startMinutes = timeToMinutes(mealSlot.timeRange.start);
  const endMinutes = timeToMinutes(mealSlot.timeRange.end);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Get the next available meal slot time
 */
export function getNextMealSlotTime(currentTime: string, mealType: 'breakfast' | 'lunch' | 'dinner'): string {
  const mealSlot = MEAL_SLOTS[mealType];
  const currentMinutes = timeToMinutes(currentTime);
  const preferredMinutes = timeToMinutes(mealSlot.preferredTime);

  if (currentMinutes < preferredMinutes) {
    return mealSlot.preferredTime;
  }

  // If preferred time has passed, use the earliest available time in the slot
  const startMinutes = timeToMinutes(mealSlot.timeRange.start);
  const endMinutes = timeToMinutes(mealSlot.timeRange.end);

  if (currentMinutes < endMinutes) {
    return minutesToTime(Math.max(currentMinutes + 30, startMinutes)); // 30 min buffer
  }

  return mealSlot.timeRange.end; // Last resort
}