import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseCsv } from '@/lib/utils/csv-parse';

// Import the formatter utility
import { formatScheduleToCompact } from '@/utils/schedule-formatter';

// Helper function to parse duration from text like "2-3 hours" or "30-45 minutes"
function parseDuration(durationText: string): number {
  if (!durationText || typeof durationText !== 'string') {
    return 60; // Default 1 hour
  }

  const text = durationText.toLowerCase();

  // Extract numbers from the text
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return 60;
  }

  // Take the first number as the base duration
  const baseNumber = parseInt(numbers[0]);

  // Convert to minutes based on unit
  if (text.includes('hour')) {
    return baseNumber * 60;
  } else if (text.includes('minute') || text.includes('min')) {
    return baseNumber;
  } else {
    // If no unit specified, assume hours for numbers > 10, minutes otherwise
    return baseNumber > 10 ? baseNumber : baseNumber * 60;
  }
}

interface Attraction {
  id: string;
  name: string;
  theme: string;
  opening_hours: string;
  duration: number;
  description: string;
  highlights: string;
  events: string;
  activities: string;
  latitude: number;
  longitude: number;
  destination: string;
}

interface ScheduleRequest {
  rankedIds: string[];
  days: number;
  destination: string;
}

interface Day {
  day: number;
  breakfast: { type: string; time: string; name: string } | null;
  lunch: { type: string; time: string; name: string } | null;
  dinner: { type: string; time: string; name: string } | null;
  attractions: Array<{
    id: string;
    name: string;
    time: string;
    duration: number;
  }>;
}

function parseSchedulingResponse(response: string, attractions: Attraction[]) {
  const lines = response.split('\n').filter(line => line.trim());
  const schedule: Day[] = [];
  let currentDay: Day | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for day header (D1, D2, etc.)
    if (trimmedLine.match(/^D\d+$/)) {
      if (currentDay) {
        schedule.push(currentDay);
      }
      currentDay = {
        day: parseInt(trimmedLine.substring(1)),
        breakfast: null,
        lunch: null,
        dinner: null,
        attractions: []
      };
      continue;
    }

    if (!currentDay) continue;

    // Parse meals
    if (trimmedLine.startsWith('B=')) {
      const timeRange = trimmedLine.substring(2);
      currentDay.breakfast = {
        type: 'breakfast',
        time: timeRange,
        name: 'Breakfast'
      };
    } else if (trimmedLine.startsWith('L=')) {
      const timeRange = trimmedLine.substring(2);
      currentDay.lunch = {
        type: 'lunch',
        time: timeRange,
        name: 'Lunch'
      };
    } else if (trimmedLine.startsWith('D=')) {
      const timeRange = trimmedLine.substring(2);
      currentDay.dinner = {
        type: 'dinner',
        time: timeRange,
        name: 'Dinner'
      };
    }
    // Parse attractions
    else if (trimmedLine.match(/^\[.+\]=.+$/)) {
      const match = trimmedLine.match(/^\[(.+)\]=(.+)$/);
      if (match) {
        const attractionId = match[1];
        const timeRange = match[2];
        const attraction = attractions.find(a => a.id === attractionId);

        if (attraction) {
          currentDay.attractions.push({
            id: attractionId,
            name: attraction.name,
            time: timeRange,
            duration: attraction.duration
          });
        }
      }
    }
  }

  // Add the last day
  if (currentDay) {
    schedule.push(currentDay);
  }

  return schedule;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleRequest = await request.json();
    const { rankedIds, days, destination } = body;

    if (!rankedIds || !Array.isArray(rankedIds) || rankedIds.length === 0) {
      return NextResponse.json(
        { error: 'rankedIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!days || days < 1 || days > 7) {
      return NextResponse.json(
        { error: 'days must be between 1 and 7' },
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'destination is required' },
        { status: 400 }
      );
    }

    // Load attractions from CSV
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCsv<Record<string, string>>(csvContent);

    // Map CSV columns to our interface
    const attractions: Attraction[] = records.map((row: Record<string, string>) => ({
      id: row.A_id || row.id || row.ID,
      name: row.Attraction || row.name,
      theme: row.Travel_Theme || row.theme,
      opening_hours: row['Opening_Time - Closing_Time'] || row.opening_hours,
      duration: parseDuration(row.Visit_Duration || row.duration) || 60,
      description: row['Description & Backstory'] || row.description,
      highlights: row['Top Highlights & Unique Features'] || row.highlights,
      events: row['Events & Experiences'] || row.events,
      activities: row['Top Things To Do'] || row.activities,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      destination: row.Place || row.destination
    }));

    // Filter attractions by ranked IDs
    const rankedAttractions = rankedIds
      .map(id => attractions.find(attraction => attraction.id === id))
      .filter(attraction => attraction !== undefined) as Attraction[];

    console.log(`Found ${rankedAttractions.length} attractions for scheduling`);

    if (rankedAttractions.length === 0) {
      return NextResponse.json(
        { error: 'No attractions found for the provided ranked IDs' },
        { status: 404 }
      );
    }

    // Validate environment variables
    if (!process.env.DS_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing DS_KEY' },
        { status: 500 }
      );
    }

    // Create the scheduling prompt
    const attractionDetails = rankedAttractions
      .map(attraction => `${attraction.id}: opening="${attraction.opening_hours}", duration=${attraction.duration}`)
      .join('\n');

    const schedulingPrompt = `You are a travel scheduling assistant. Follow instructions strictly.

Input:

Days: ${days}

Meals (FLEXIBLE TIMING - choose optimal times within ranges):

Breakfast (B): 08:00–09:30 (30–45 min duration)

Lunch (L): 13:00–14:30 (60 min duration)

Dinner (D): 20:00–21:30 (60 min duration)

Buffer (between attractions): MINIMUM 60 min, PREFERRED 90 min (1-1.5 hours)

Attractions (ID → details):
${attractionDetails}

Task:

Use only the ranked attractions provided.

Distribute them across ${days} days.

Each day must include:

Exactly 1 Breakfast, 1 Lunch, 1 Dinner (choose optimal start times within their ranges).

PRIORITY 1: Maintain MINIMUM 60 min buffer between attractions (travel time).

PRIORITY 2: Fit 3-4 attractions per day (prefer 4, but 3 is acceptable if buffer requires it).

Events must not overlap; STRICT buffer enforcement between attractions.

Attractions must end before 19:00.

Meal timing flexibility: Choose start times within ranges to optimize attraction scheduling.

Daily order is flexible: Arrange B, L, D and attractions optimally within time constraints.

All attractions appear exactly once across all days.

Higher-ranked attractions must appear earlier in the trip.

Do not output names, only IDs.

Output (STRICT, compact, 24-hour format):

D1
B=08:15-08:45
L=13:00-14:00
D=20:00-21:00
[ID3]=09:30-11:00
[ID7]=12:00-13:00
[ID1]=14:30-16:00
[ID5]=17:00-18:30

D2
B=08:00-08:30
L=13:15-14:15
D=20:30-21:30
[ID6]=09:00-10:30
[ID8]=11:30-12:45
[ID9]=14:45-16:15
[ID10]=17:15-18:30`;

    // Call OpenRouter AI API for intelligent scheduling
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DS_KEY}`,
        'HTTP-Referer': 'https://quick-ai-itinerary.vercel.app',
        'X-Title': 'Quick AI Itinerary',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: schedulingPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const schedulingResponse = aiResponse.choices[0]?.message?.content;

    if (!schedulingResponse) {
      throw new Error('No content received from AI API');
    }

    console.log('AI Scheduling Response for Compact Format:', schedulingResponse);

    // Parse the AI response to create schedule structure
    const schedule = parseSchedulingResponse(schedulingResponse, rankedAttractions);

    // Create the full response object
    const fullResponse = {
      success: true,
      data: {
        schedule
      }
    };

    // Format to compact format
    const compactFormat = formatScheduleToCompact(fullResponse);

    return NextResponse.json({
      success: true,
      data: {
        compactFormat,
        fullSchedule: fullResponse.data.schedule
      },
      metadata: {
        attractionsFound: rankedAttractions.length,
        daysScheduled: days,
        destination,
        note: 'Compact format generated successfully'
      }
    });

  } catch (error) {
    console.error('Schedule compact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}