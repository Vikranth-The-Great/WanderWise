// Enhanced scheduling algorithm for organizing ranked attractions into time slots
// Based on opening hours, closing times, visit duration, and travel distance

import { 
  getDistanceBetweenAttractions, 
  optimizeAttractionOrder, 
  estimateTravelTime,
  isReasonableDayDistance 
} from './distance-calculator';

// Import types from travelai-workflow
interface ParsedAttraction {
  orig_id: string;
  name: string;
  place: string;
  opening_intervals: string[];
  visit_minutes: number;
  latitude: number;
  longitude: number;
  themes: string;
  rating?: number;
}

interface ScheduledDay {
  destination: string;
  day: number;
  meals: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
  visits: {
    num: number;
    orig_id: string;
    name: string;
    start: string;
    end: string;
    duration_min: number;
    opening_intervals: string;
  }[];
}

interface AttractionTimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  openTime: string;
  closeTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  themes: string[];
  rating: number;
}

interface DaySchedule {
  day: number;
  date: string;
  attractions: AttractionTimeSlot[];
  totalDuration: number;
}

interface SchedulingResult {
  schedule: DaySchedule[];
  unscheduledAttractions: string[];
  totalScheduledAttractions: number;
}

// Parse time string (HH:MM) to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr.trim() === '') {
    return 0;
  }
  
  // Handle AM/PM format
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const cleanTime = timeStr.replace(/\s+/g, ' ').trim();
    const [time, period] = cleanTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    return adjustedHours * 60 + (minutes || 0);
  }
  
  // Handle 24-hour format
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

// Convert minutes since midnight to time string (HH:MM)
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Parse complex opening hours format (e.g., "4:30 AM - 5:20 AM; 7:15 AM - 1:15 PM; 4:15 PM - 8:00 PM")
function parseOpeningHours(openingTimeStr: string, closingTimeStr: string): { openTime: string; closeTime: string } {
  // Handle null/undefined/empty values
  if (!openingTimeStr || !closingTimeStr || openingTimeStr.trim() === '' || closingTimeStr.trim() === '') {
    return {
      openTime: '09:00',
      closeTime: '18:00'
    };
  }

  // Handle simple format first (HH:MM)
  if (openingTimeStr.includes(':') && !openingTimeStr.includes(';') && !openingTimeStr.includes('AM') && !openingTimeStr.includes('PM')) {
    return {
      openTime: openingTimeStr,
      closeTime: closingTimeStr
    };
  }

  // Handle complex format with multiple time slots
  if (openingTimeStr.includes(';')) {
    // For now, take the first time slot
    const firstSlot = openingTimeStr.split(';')[0].trim();
    const timeRange = firstSlot.split(' - ');
    if (timeRange.length === 2) {
      return {
        openTime: convertTo24Hour(timeRange[0].trim()),
        closeTime: convertTo24Hour(timeRange[1].trim())
      };
    }
  }

  // Handle single time range format
  if (openingTimeStr.includes(' - ')) {
    const timeRange = openingTimeStr.split(' - ');
    if (timeRange.length === 2) {
      return {
        openTime: convertTo24Hour(timeRange[0].trim()),
        closeTime: convertTo24Hour(timeRange[1].trim())
      };
    }
  }

  // Fallback to original format
  return {
    openTime: openingTimeStr,
    closeTime: closingTimeStr
  };
}

// Convert 12-hour format to 24-hour format
function convertTo24Hour(timeStr: string): string {
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    return timeStr; // Already in 24-hour format
  }

  const isAM = timeStr.includes('AM');
  const isPM = timeStr.includes('PM');
  const timeOnly = timeStr.replace(/AM|PM/g, '').trim();
  
  let [hours, minutes] = timeOnly.split(':').map(str => parseInt(str.trim()));
  
  if (isNaN(minutes)) minutes = 0;
  
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Check if an attraction can fit in the remaining time of a day
function canFitAttraction(
  currentTime: number, // minutes since midnight
  attractionDuration: number, // minutes
  attractionOpenTime: number, // minutes since midnight
  attractionCloseTime: number, // minutes since midnight
  dayEndTime: number = 18 * 60, // 6 PM default
  travelTimeFromPrevious: number = 0 // travel time in minutes
): { canFit: boolean; startTime: number; endTime: number } {
  // Account for travel time from previous attraction
  const adjustedCurrentTime = currentTime + travelTimeFromPrevious;
  
  // Ensure attraction is open
  const earliestStart = Math.max(adjustedCurrentTime, attractionOpenTime);
  const latestEnd = Math.min(attractionCloseTime, dayEndTime);
  

  
  // Check if there's enough time
  if (earliestStart + attractionDuration <= latestEnd) {
    return {
      canFit: true,
      startTime: earliestStart,
      endTime: earliestStart + attractionDuration
    };
  }
  
  return {
    canFit: false,
    startTime: earliestStart,
    endTime: earliestStart + attractionDuration
  };
}

// Helper function to check if two time slots overlap
function hasTimeOverlap(
  start1: number, end1: number,
  start2: number, end2: number,
  bufferMinutes: number = 30
): boolean {
  // Add buffer time to prevent tight scheduling
  const bufferedEnd1 = end1 + bufferMinutes;
  const bufferedStart2 = start2 - bufferMinutes;
  
  return start1 < end2 && start2 < bufferedEnd1;
}

// Helper function to check if a time slot conflicts with existing attractions
function hasConflictWithExisting(
  proposedStart: number,
  proposedEnd: number,
  existingAttractions: AttractionTimeSlot[],
  bufferMinutes: number = 30
): boolean {
  return existingAttractions.some(attraction => {
    const existingStart = parseTimeToMinutes(attraction.startTime);
    const existingEnd = parseTimeToMinutes(attraction.endTime);
    return hasTimeOverlap(proposedStart, proposedEnd, existingStart, existingEnd, bufferMinutes);
  });
}

// Helper function to validate and fix overlapping attractions
function validateAndFixOverlaps(attractions: AttractionTimeSlot[]): AttractionTimeSlot[] {
  if (attractions.length <= 1) return attractions;
  
  const validatedAttractions: AttractionTimeSlot[] = [];
  const sortedAttractions = [...attractions].sort((a, b) => 
    parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  );
  
  for (let i = 0; i < sortedAttractions.length; i++) {
    const currentAttraction = { ...sortedAttractions[i] };
    const currentStart = parseTimeToMinutes(currentAttraction.startTime);
    const currentEnd = parseTimeToMinutes(currentAttraction.endTime);
    
    // Check for conflicts with already validated attractions
    let hasConflict = false;
    for (const validatedAttraction of validatedAttractions) {
      const validatedStart = parseTimeToMinutes(validatedAttraction.startTime);
      const validatedEnd = parseTimeToMinutes(validatedAttraction.endTime);
      
      if (hasTimeOverlap(currentStart, currentEnd, validatedStart, validatedEnd, 30)) {
        hasConflict = true;
        
        // Try to reschedule the current attraction after the conflicting one
        const newStartTime = validatedEnd + 45; // 45 minutes buffer
        const newEndTime = newStartTime + currentAttraction.duration;
        
        // Check if the new time is within reasonable bounds (before 6 PM)
        if (newEndTime <= 18 * 60) {
          currentAttraction.startTime = minutesToTimeString(newStartTime);
          currentAttraction.endTime = minutesToTimeString(newEndTime);
          console.log(`Rescheduled ${currentAttraction.name} to ${currentAttraction.startTime}-${currentAttraction.endTime} to avoid overlap`);
        } else {
          // Cannot reschedule, skip this attraction
          console.log(`Removed ${currentAttraction.name} due to unresolvable timing conflict`);
          hasConflict = true;
          break;
        }
      }
    }
    
    if (!hasConflict) {
      validatedAttractions.push(currentAttraction);
    }
  }
  
  return validatedAttractions;
}

// Helper function to group attractions by proximity with better distribution
function groupAttractionsByProximity(
  attractionNames: string[],
  tripDuration: number,
  maxDayDistanceKm: number
): string[][] {
  if (attractionNames.length === 0) return [];
  
  const groups: string[][] = Array.from({ length: tripDuration }, () => []);
  const targetPerDay = Math.ceil(attractionNames.length / tripDuration);
  
  console.log(`Distributing ${attractionNames.length} attractions across ${tripDuration} days (target: ${targetPerDay} per day)`);
  
  // Simple round-robin distribution to ensure even spread
  for (let i = 0; i < attractionNames.length; i++) {
    const dayIndex = i % tripDuration;
    groups[dayIndex].push(attractionNames[i]);
  }
  
  // Log the distribution
  groups.forEach((group, index) => {
    console.log(`Day ${index + 1}: ${group.length} attractions - ${group.slice(0, 3).join(', ')}${group.length > 3 ? '...' : ''}`);
  });
  
  return groups;
}

// Main scheduling function with improved time distribution
export function scheduleRankedAttractions(
  rankedAttractionNames: string[],
  attractionsData: Array<{
    Attraction: string;
    A_id?: string;
    Opening_Time: string;
    Closing_Time: string;
    Visit_Duration_Minutes: string;
    Latitude: string;
    Longitude: string;
    Travel_Theme?: string;
    Rating: string;
  }>,
  tripDuration: number,
  startDate: string,
  dailyStartTime: string = '09:00',
  dailyEndTime: string = '18:00',
  maxDayDistanceKm: number = 50 // Maximum travel distance per day
): SchedulingResult {
  const schedule: DaySchedule[] = [];
  
  // Create attraction lookup map
  const attractionMap = new Map<string, typeof attractionsData[0]>();
  attractionsData.forEach(attraction => {
    attractionMap.set(attraction.Attraction, attraction);
  });

  // Filter attractions that exist in our data
  const availableAttractions = rankedAttractionNames.filter(name => 
    attractionMap.has(name)
  );

  console.log(`Found ${availableAttractions.length} available attractions from ${rankedAttractionNames.length} ranked attractions`);

  const dailyStartMinutes = parseTimeToMinutes(dailyStartTime);
  const dailyEndMinutes = parseTimeToMinutes(dailyEndTime);
  const unscheduledAttractions: string[] = [];
  let totalScheduledAttractions = 0;

  // Group attractions by proximity for optimal daily routing
  const attractionGroups = groupAttractionsByProximity(availableAttractions, tripDuration, maxDayDistanceKm);

  // Schedule attractions day by day
  for (let day = 1; day <= tripDuration; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + (day - 1));
    const dateString = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const daySchedule: DaySchedule = {
      day,
      date: dateString,
      attractions: [],
      totalDuration: 0
    };

    const dayAttractions = attractionGroups[day - 1] || [];
    
    // Optimize attraction order within the day for minimal travel distance
    const optimizedOrder = optimizeAttractionOrder(dayAttractions);

    console.log(`Day ${day}: Attempting to schedule ${optimizedOrder.length} attractions in optimized order`);

    // Calculate available time slots with proper distribution
    const availableMinutes = dailyEndMinutes - dailyStartMinutes;
    const mealBreakTime = 180; // 3 hours for meals and breaks
    const effectiveTime = availableMinutes - mealBreakTime;
    // Allow 3-4 attractions per day by reducing time allocation per attraction
    const targetAttractionsPerDay = Math.min(optimizedOrder.length, Math.max(3, Math.floor(effectiveTime / 90))); // 1.5 hours per attraction including travel/buffer
    
    // Calculate time slot duration for even distribution with proper spacing
    const timeSlotDuration = Math.floor(effectiveTime / Math.max(targetAttractionsPerDay, 1));
    const bufferBetweenAttractions = 60; // 1 hour buffer between attractions
    
    let currentTime = dailyStartMinutes;
    let previousAttraction: string | null = null;
    let scheduledCount = 0;
    const scheduledAttractions: AttractionTimeSlot[] = [];

    for (const attractionName of optimizedOrder) {
      if (scheduledCount >= targetAttractionsPerDay) {
        unscheduledAttractions.push(attractionName);
        continue;
      }

      const attractionData = attractionMap.get(attractionName);
      if (!attractionData) continue;

      const { openTime, closeTime } = parseOpeningHours(
        attractionData.Opening_Time || '',
        attractionData.Closing_Time || ''
      );

      const openMinutes = parseTimeToMinutes(openTime);
      const closeMinutes = parseTimeToMinutes(closeTime);
      const duration = parseInt(attractionData.Visit_Duration_Minutes) || 120;

      // Calculate realistic travel time from previous attraction
      let travelTime = 0;
      if (previousAttraction) {
        const distance = getDistanceBetweenAttractions(previousAttraction, attractionName);
        
        // More realistic travel time calculation based on distance
        if (distance === 0) {
          travelTime = 10; // Minimum 10 minutes for walking within same complex
        } else if (distance <= 1) {
          travelTime = 15; // 15 minutes for very close attractions
        } else if (distance <= 3) {
          travelTime = Math.max(20, estimateTravelTime(distance, 20)); // Local transport, slower speed
        } else if (distance <= 10) {
          travelTime = Math.max(30, estimateTravelTime(distance, 25)); // Medium distance
        } else {
          travelTime = Math.min(estimateTravelTime(distance, 30), 90); // Cap at 1.5 hours for long distances
        }
      }

      // Calculate ideal start time for even distribution with proper spacing
      const idealStartTime = dailyStartMinutes + (scheduledCount * timeSlotDuration);
      let proposedStartTime = Math.max(
        currentTime + travelTime + 30, // Previous attraction end + travel + buffer
        idealStartTime, // Ideal distributed time
        openMinutes // Attraction opening time
      );
      
      // Avoid scheduling during meal times with proper conflict detection
      const breakfastStart = 8 * 60; // 8:00 AM
      const breakfastEnd = 9 * 60; // 9:00 AM
      const lunchStart = 13 * 60; // 1:00 PM
      const lunchEnd = 14 * 60; // 2:00 PM
      const dinnerStart = 19 * 60 + 30; // 7:30 PM
      const dinnerEnd = 21 * 60; // 9:00 PM
      
      // Check for breakfast conflict
      if (proposedStartTime < breakfastEnd && proposedStartTime + duration > breakfastStart) {
        proposedStartTime = Math.max(proposedStartTime, breakfastEnd + 15); // 15 min after breakfast
      }
      
      // Check for lunch conflict - attractions must not overlap with lunch window
      if (proposedStartTime < lunchEnd && proposedStartTime + duration > lunchStart) {
        // Try to fit before lunch
        if (proposedStartTime + duration <= lunchStart) {
          // Can fit before lunch, no change needed
        } else {
          // Move after lunch with buffer
          proposedStartTime = Math.max(proposedStartTime, lunchEnd + 15); // 15 min after lunch
        }
      }
      
      // Check for dinner conflict
      if (proposedStartTime < dinnerEnd && proposedStartTime + duration > dinnerStart) {
        if (proposedStartTime + duration <= dinnerStart) {
          // Can fit before dinner, no change needed
        } else {
          // Skip this attraction for today as it conflicts with dinner
          unscheduledAttractions.push(attractionName);
          console.log(`Could not fit: ${attractionName} (conflicts with dinner time)`);
          continue;
        }
      }

      const fitResult = canFitAttraction(
        proposedStartTime,
        duration,
        openMinutes,
        closeMinutes,
        dailyEndMinutes,
        0 // Travel time already accounted for
      );

      // Check for conflicts with already scheduled attractions
      const hasConflict = hasConflictWithExisting(
        fitResult.startTime,
        fitResult.endTime,
        scheduledAttractions,
        45 // 45 minute buffer
      );

      if (fitResult.canFit && !hasConflict) {
        const timeSlot: AttractionTimeSlot = {
          id: attractionData.A_id || `${day}-${daySchedule.attractions.length}`,
          name: attractionName,
          startTime: minutesToTimeString(fitResult.startTime),
          endTime: minutesToTimeString(fitResult.endTime),
          duration,
          openTime,
          closeTime,
          coordinates: {
            lat: parseFloat(attractionData.Latitude) || 0,
            lng: parseFloat(attractionData.Longitude) || 0
          },
          themes: attractionData.Travel_Theme ? [attractionData.Travel_Theme] : [],
          rating: parseFloat(attractionData.Rating) || 0
        };

        daySchedule.attractions.push(timeSlot);
        scheduledAttractions.push(timeSlot);
        daySchedule.totalDuration += duration + travelTime;
        currentTime = fitResult.endTime + bufferBetweenAttractions; // Use consistent buffer time
        totalScheduledAttractions++;
        scheduledCount++;
        previousAttraction = attractionName;

        console.log(`Scheduled: ${attractionName} at ${timeSlot.startTime}-${timeSlot.endTime} (travel: ${travelTime}min, slot: ${scheduledCount}/${targetAttractionsPerDay})`);
      } else {
        unscheduledAttractions.push(attractionName);
        console.log(`Could not fit: ${attractionName} (travel time: ${travelTime}min)`);
      }
    }

    // Try to reschedule unscheduled attractions in available gaps
    if (unscheduledAttractions.length > 0 && daySchedule.attractions.length > 0) {
      const rescheduledAttractions = [];
      
      for (const attractionName of [...unscheduledAttractions]) {
        const attractionData = attractionMap.get(attractionName);
        if (!attractionData) continue;
        
        const duration = parseInt(attractionData.Visit_Duration_Minutes) || 120;
        const { openTime, closeTime } = parseOpeningHours(attractionData.Opening_Time, attractionData.Closing_Time);
        const openMinutes = parseTimeToMinutes(openTime);
        const closeMinutes = parseTimeToMinutes(closeTime);
        
        // Try to fit in gaps between scheduled attractions
        const sortedAttractions = [...scheduledAttractions].sort((a, b) => 
          parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
        );
        
        for (let i = 0; i <= sortedAttractions.length; i++) {
          let gapStart, gapEnd;
          
          if (i === 0) {
            // Gap before first attraction
            gapStart = dailyStartMinutes;
            gapEnd = parseTimeToMinutes(sortedAttractions[0].startTime);
          } else if (i === sortedAttractions.length) {
            // Gap after last attraction
            gapStart = parseTimeToMinutes(sortedAttractions[i-1].endTime);
            gapEnd = dailyEndMinutes;
          } else {
            // Gap between attractions
            gapStart = parseTimeToMinutes(sortedAttractions[i-1].endTime);
            gapEnd = parseTimeToMinutes(sortedAttractions[i].startTime);
          }
          
          // Check if attraction can fit in this gap (with buffers)
          const requiredTime = duration + 90; // Include buffer time
          if (gapEnd - gapStart >= requiredTime) {
            const proposedStart = Math.max(gapStart + 45, openMinutes);
            const proposedEnd = proposedStart + duration;
            
            // Check if proposed time fits within gap and attraction hours, doesn't conflict with existing attractions, and doesn't end after 19:00
            if (proposedEnd <= Math.min(gapEnd - 45, closeMinutes) && 
                !hasConflictWithExisting(proposedStart, proposedEnd, scheduledAttractions) &&
                proposedEnd <= 19 * 60) { // No attractions ending after 19:00 (7 PM)
              const timeSlot: AttractionTimeSlot = {
                id: attractionData.A_id || `${day}-gap-${rescheduledAttractions.length}`,
                name: attractionName,
                startTime: minutesToTimeString(proposedStart),
                endTime: minutesToTimeString(proposedEnd),
                duration,
                openTime,
                closeTime,
                coordinates: {
                  lat: parseFloat(attractionData.Latitude) || 0,
                  lng: parseFloat(attractionData.Longitude) || 0
                },
                themes: attractionData.Travel_Theme ? [attractionData.Travel_Theme] : [],
                rating: parseFloat(attractionData.Rating) || 0
              };
              
              daySchedule.attractions.push(timeSlot);
              scheduledAttractions.push(timeSlot);
              rescheduledAttractions.push(attractionName);
              totalScheduledAttractions++;
              console.log(`Rescheduled in gap: ${attractionName} at ${timeSlot.startTime}-${timeSlot.endTime}`);
              break;
            }
          }
        }
      }
      
      // Remove rescheduled attractions from unscheduled list
      rescheduledAttractions.forEach(name => {
        const index = unscheduledAttractions.indexOf(name);
        if (index > -1) unscheduledAttractions.splice(index, 1);
      });
    }

    // Sort attractions by start time and validate for overlaps
    daySchedule.attractions.sort((a, b) => 
      parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
    
    // Validate and fix any remaining overlaps
    const validatedAttractions = validateAndFixOverlaps(daySchedule.attractions);
    daySchedule.attractions = validatedAttractions;
    
    console.log(`Day ${day}: Scheduled ${daySchedule.attractions.length} attractions`);
    schedule.push(daySchedule);
  }
  
  return {
    schedule,
    unscheduledAttractions,
    totalScheduledAttractions
  };
}

// Convert scheduled attractions to the format expected by the frontend with intelligent meal scheduling
export function convertToItineraryFormat(
  schedulingResult: SchedulingResult, 
  userPreferences: {
    budget?: string;
    mealPreferences?: string[];
    destination?: string;
    [key: string]: unknown;
  }
) {
  const dayPlans = schedulingResult.schedule.map(daySchedule => {
    const activities = [];
    
    // Add scheduled attractions first
    daySchedule.attractions.forEach(attraction => {
      activities.push({
        time: attraction.startTime,
        title: attraction.name,
        location: attraction.name,
        description: `Visit ${attraction.name} - ${attraction.themes.join(', ')}`,
        duration: `${Math.round(attraction.duration / 60 * 10) / 10} hours`,
        cost: getBudgetCost(userPreferences.budget, 'attraction'),
        type: 'attraction',
        coordinates: attraction.coordinates
      });
    });
    
    // Intelligently schedule meals based on attraction times
    const attractionTimes = daySchedule.attractions.map(a => parseTimeToMinutes(a.startTime));
    
    // Add breakfast (consistent with conflict detection)
    activities.push({
      time: '08:00',
      title: 'Breakfast',
      location: `Local restaurant near ${userPreferences.destinations?.[0] || 'your destination'}`,
      description: 'Start your day with a delicious local breakfast',
      duration: '1 hour',
      cost: getBudgetCost(userPreferences.budget, 'meal'),
      type: 'meal'
    });
    
    // Add lunch with consistent timing (13:00-14:00 to match conflict detection)
    activities.push({
      time: '13:00',
      title: 'Lunch',
      location: `Restaurant near ${userPreferences.destinations?.[0] || 'your destination'}`,
      description: 'Enjoy authentic local cuisine',
      duration: '1 hour',
      cost: getBudgetCost(userPreferences.budget, 'meal'),
      type: 'meal'
    });
    
    // Add dinner with proper timing (7:30-8:30 PM range)
    let dinnerTime = '19:30'; // Default dinner time
    if (daySchedule.attractions.length > 0) {
      const attractionEndTimes = daySchedule.attractions.map(a => parseTimeToMinutes(a.endTime));
      const lastAttractionEnd = Math.max(...attractionEndTimes);
      
      if (lastAttractionEnd > 18 * 60) { // If last attraction ends after 6 PM
        const earliestDinner = lastAttractionEnd + 90; // 1.5 hours after last attraction
        dinnerTime = minutesToTimeString(Math.max(earliestDinner, 19 * 60 + 30)); // At least 7:30 PM
      }
    }
    
    activities.push({
      time: dinnerTime,
      title: 'Dinner',
      location: `Local restaurant near ${userPreferences.destinations?.[0] || 'your destination'}`,
      description: 'End your day with a wonderful dinner',
      duration: '1.5 hours',
      cost: getBudgetCost(userPreferences.budget, 'meal'),
      type: 'meal'
    });
    
    // Sort activities by time
    activities.sort((a, b) => a.time.localeCompare(b.time));
    
    return {
      day: daySchedule.day,
      date: daySchedule.date,
      activities
    };
  });
  
  return dayPlans;
}

// Helper function to get budget-appropriate costs
function getBudgetCost(budget: string, type: 'meal' | 'attraction'): string {
  const budgetMultipliers = {
    'budget': { meal: 10, attraction: 15 },
    'mid-range': { meal: 25, attraction: 35 },
    'luxury': { meal: 50, attraction: 75 }
  };
  
  const multiplier = budgetMultipliers[budget.toLowerCase()] || budgetMultipliers['mid-range'];
  return `$${multiplier[type]}`;
}

// Function to schedule attractions for a single day using improved algorithm
export function scheduleAttractionsForDay(
  attractions: ParsedAttraction[],
  dayTemplate: ScheduledDay,
  numericMapping: Map<number, ParsedAttraction>
): ScheduledDay {
  const scheduledDay: ScheduledDay = {
    ...dayTemplate,
    visits: []
  };
  
  const bufferBetweenAttractions = 15; // minutes - reduced for more attractions per day
  const scheduledAttractions: { startTime: string; endTime: string; attraction: ParsedAttraction }[] = [];
  
  // Helper function to add minutes to time string
  function addMinutes(timeStr: string, minutes: number): string {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }
  
  // Helper function to check if time conflicts with meals
  function isTimeConflict(start: string, end: string): boolean {
    const meals = scheduledDay.meals;
    return (
      (start < meals.breakfast.end && end > meals.breakfast.start) ||
      (start < meals.lunch.end && end > meals.lunch.start) ||
      (start < meals.dinner.end && end > meals.dinner.start)
    );
  }
  
  // Helper function to check conflicts with existing attractions
  function hasConflictWithExisting(startTime: string, endTime: string): boolean {
    return scheduledAttractions.some(slot => 
      (startTime < slot.endTime && endTime > slot.startTime)
    );
  }
  
  // Main scheduling loop
  let currentTime = '09:00';
  
  console.log(`[DEBUG] Starting scheduling for ${attractions.length} attractions`);
  console.log(`🔥 SCHEDULING FUNCTION CALLED - This should appear in output! 🔥`);
  
  for (const attraction of attractions) {
    let scheduled = false;
    console.log(`[DEBUG] Attempting to schedule: ${attraction.name}`);
    
    // Try to find a suitable time slot - increased attempts for better scheduling
    for (let attempt = 0; attempt < 20 && !scheduled; attempt++) {
      const proposedStart = currentTime;
      const proposedEnd = addMinutes(proposedStart, attraction.visit_minutes);
      
      // Check if within opening hours
      const isWithinOpeningHours = attraction.opening_intervals.some(interval => {
        const [openTime, closeTime] = interval.split('-');
        return proposedStart >= openTime && proposedEnd <= closeTime;
      });
      
      // Check if attraction ends after 21:30 (extended day for more attractions)
      const proposedEndMinutes = parseTimeToMinutes(proposedEnd);
      // Handle midnight wraparound: if end time is past midnight (0-6 hours), treat as next day
      const endsAfter2130 = proposedEndMinutes > 21.5 * 60 || (proposedEndMinutes >= 0 && proposedEndMinutes < 6 * 60); // 21:30 = 1290 minutes, 06:00 = 360 minutes
      
      // Debug: console.log(`${attraction.name} - Attempt ${attempt + 1}: ${proposedStart}-${proposedEnd}, endsAfter19: ${endsAfter19}`);
      
      if (isWithinOpeningHours && 
          !isTimeConflict(proposedStart, proposedEnd) &&
          !hasConflictWithExisting(proposedStart, proposedEnd) &&
          !endsAfter2130) {
        
        // Schedule the attraction
        const numericId = Array.from(numericMapping.entries())
          .find(([, attr]) => attr.orig_id === attraction.orig_id)?.[0] || scheduledDay.visits.length + 1;
        
        const timeSlot = {
          startTime: proposedStart,
          endTime: proposedEnd,
          attraction
        };
        
        scheduledAttractions.push(timeSlot);
        
        scheduledDay.visits.push({
          num: numericId,
          orig_id: attraction.orig_id,
          name: attraction.name,
          start: proposedStart,
          end: proposedEnd,
          duration_min: attraction.visit_minutes,
          opening_intervals: attraction.opening_intervals.join(';')
        });
        
        console.log(`[DEBUG] ✓ Scheduled ${attraction.name} at ${proposedStart}-${proposedEnd}`);
    console.log(`[DEBUG] Total scheduled so far: ${scheduledDay.visits.length}`);
        currentTime = addMinutes(proposedEnd, bufferBetweenAttractions);
        scheduled = true;
      } else {
        // Try next 15-minute slot for more aggressive scheduling
        currentTime = addMinutes(currentTime, 15);
        console.log(`[DEBUG] ❌ Could not schedule ${attraction.name} at ${proposedStart}-${proposedEnd}. Reasons: openingHours=${isWithinOpeningHours}, timeConflict=${isTimeConflict(proposedStart, proposedEnd)}, existingConflict=${hasConflictWithExisting(proposedStart, proposedEnd)}, endsAfter2130=${endsAfter2130}`);
      }
    }
    
    // If couldn't schedule in main loop, try to fit in gaps
    if (!scheduled) {
      console.log(`[DEBUG] ⚠️ Could not schedule ${attraction.name} in main loop, trying gaps...`);
      const sortedAttractions = [...scheduledAttractions].sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < sortedAttractions.length - 1; i++) {
        const gapStart = sortedAttractions[i].endTime;
        const gapEnd = sortedAttractions[i + 1].startTime;
        const gapDuration = (parseTimeToMinutes(gapEnd) - parseTimeToMinutes(gapStart));
        
        if (gapDuration >= attraction.visit_minutes + bufferBetweenAttractions) {
          const proposedStart = addMinutes(gapStart, bufferBetweenAttractions);
          const proposedEnd = addMinutes(proposedStart, attraction.visit_minutes);
          
          const isWithinOpeningHours = attraction.opening_intervals.some(interval => {
            const [openTime, closeTime] = interval.split('-');
            return proposedStart >= openTime && proposedEnd <= closeTime;
          });
          
          // Check if attraction ends after 21:30 (extended day for more attractions)
          const proposedEndMinutes = parseTimeToMinutes(proposedEnd);
          // Handle midnight wraparound: if end time is past midnight (0-6 hours), treat as next day
          const endsAfter2130 = proposedEndMinutes > 21.5 * 60 || (proposedEndMinutes >= 0 && proposedEndMinutes < 6 * 60); // 21:30 = 1290 minutes, 06:00 = 360 minutes
          
          if (isWithinOpeningHours && 
              !isTimeConflict(proposedStart, proposedEnd) &&
              !hasConflictWithExisting(proposedStart, proposedEnd) &&
              !endsAfter2130) {
            
            const numericId = Array.from(numericMapping.entries())
              .find(([, attr]) => attr.orig_id === attraction.orig_id)?.[0] || scheduledDay.visits.length + 1;
            
            const timeSlot = {
              startTime: proposedStart,
              endTime: proposedEnd,
              attraction
            };
            
            scheduledAttractions.push(timeSlot);
            
            scheduledDay.visits.push({
              num: numericId,
              orig_id: attraction.orig_id,
              name: attraction.name,
              start: proposedStart,
              end: proposedEnd,
              duration_min: attraction.visit_minutes,
              opening_intervals: attraction.opening_intervals.join(';')
            });
            
            scheduled = true;
            break;
          }
        }
      }
    }
  }
  
  // Sort visits by start time
  scheduledDay.visits.sort((a, b) => a.start.localeCompare(b.start));
  
  return scheduledDay;
}