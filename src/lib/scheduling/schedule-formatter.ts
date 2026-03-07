/**
 * Utility to format scheduling API response to compact format
 * Expected format:
 * D1
 * B=08:15-08:45
 * L=13:00-14:00
 * D=20:00-21:00
 * [ID3]=09:30-11:00
 * [ID7]=11:45-12:45
 * ...
 */

interface Meal {
  type: string;
  time: string;
  name: string;
}

interface Attraction {
  id: string;
  name: string;
  time: string;
  duration: number;
}

interface DaySchedule {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  attractions: Attraction[];
}

interface ScheduleResponse {
  success: boolean;
  data: {
    schedule: DaySchedule[];
  };
}

/**
 * Formats the full schedule response structure into a compact string representation.
 * Useful for debugging or passing schedule data to size-constrained contexts.
 * 
 * @param response - The full schedule response object.
 * @returns Compact string representation of the schedule.
 */
export function formatScheduleToCompact(response: ScheduleResponse): string {
  if (!response.success || !response.data?.schedule) {
    return 'Invalid schedule response';
  }

  const lines: string[] = [];

  response.data.schedule.forEach((daySchedule) => {
    // Add day header
    lines.push(`D${daySchedule.day}`);

    // Add meals
    lines.push(`B=${daySchedule.breakfast.time}`);
    lines.push(`L=${daySchedule.lunch.time}`);
    lines.push(`D=${daySchedule.dinner.time}`);

    // Add attractions
    daySchedule.attractions.forEach((attraction) => {
      lines.push(`[${attraction.id}]=${attraction.time}`);
    });

    // Add empty line between days (except for last day)
    if (daySchedule.day < response.data.schedule.length) {
      lines.push('');
    }
  });

  return lines.join('\n');
}

// Test function to demonstrate usage
export function testFormatter() {
  const sampleResponse: ScheduleResponse = {
    success: true,
    data: {
      schedule: [
        {
          day: 1,
          breakfast: { type: 'breakfast', time: '08:15-08:45', name: 'Breakfast' },
          lunch: { type: 'lunch', time: '13:00-14:00', name: 'Lunch' },
          dinner: { type: 'dinner', time: '20:00-21:00', name: 'Dinner' },
          attractions: [
            { id: 'A0155', name: 'Lalbagh Botanical Garden', time: '09:30-11:00', duration: 210 },
            { id: 'A0156', name: 'Cubbon Park', time: '11:45-12:45', duration: 90 },
            { id: 'A0157', name: 'Bangalore Palace', time: '15:30-17:00', duration: 60 },
            { id: 'A0161', name: 'ISKCON Temple Bangalore', time: '17:45-18:45', duration: 75 }
          ]
        },
        {
          day: 2,
          breakfast: { type: 'breakfast', time: '08:00-08:30', name: 'Breakfast' },
          lunch: { type: 'lunch', time: '13:15-14:15', name: 'Lunch' },
          dinner: { type: 'dinner', time: '20:30-21:30', name: 'Dinner' },
          attractions: [
            { id: 'A0164', name: 'Bannerghatta National Park', time: '09:00-10:30', duration: 90 },
            { id: 'A0165', name: 'Vidhana Soudha', time: '11:30-12:45', duration: 75 },
            { id: 'A0172', name: 'Bull Temple', time: '15:00-16:30', duration: 90 },
            { id: 'A0173', name: 'Tipu Sultan\'s Summer Palace', time: '17:15-18:30', duration: 75 }
          ]
        }
      ]
    }
  };

  return formatScheduleToCompact(sampleResponse);
}