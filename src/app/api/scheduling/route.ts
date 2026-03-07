import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

/**
 * Request body for scheduling attractions.
 */
interface SchedulingRequest {
  rankedIds: string[];
  days: number;
  destination: string;
}

interface Attraction {
  id: string;
  name: string;
  opening_hours: string;
  duration: number;
  destination: string;
}

/**
 * POST handler for scheduling attractions into a daily itinerary.
 * Uses AI to distribute attractions across days while respecting constraints.
 * 
 * @param request - Next.js request object.
 * @returns JSON object with the generated schedule.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.DS_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing DS_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { rankedIds, days, destination }: SchedulingRequest = body;

    console.log('🗓️ SCHEDULING PROCESS - Starting Attraction Scheduling:', {
      destination,
      days,
      attractionsToSchedule: rankedIds.length,
      rankedIds,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!rankedIds || !Array.isArray(rankedIds) || rankedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ranked IDs array is required' },
        { status: 400 }
      );
    }

    if (!days || days <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid number of days is required' },
        { status: 400 }
      );
    }

    // Load attractions from CSV
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const allAttractions: Attraction[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    }).map((row: any) => ({
      id: row.A_id || row.id || row.ID,
      name: row.Attraction || row.name || row.Name,
      opening_hours: row['Opening_Time - Closing_Time'] || row.opening_hours || row.Opening_Hours || '09:00-18:00',
      duration: parseFloat(row.Visit_Duration || row.duration || row.Duration || '2') * 60,
      destination: row.Place || row.destination || row.Destination
    }));

    // Get attraction details for the ranked IDs
    const rankedAttractions = rankedIds.map(id => {
      const attraction = allAttractions.find(a => a.id === id);
      if (!attraction) {
        throw new Error(`Attraction with ID ${id} not found`);
      }
      return attraction;
    });

    console.log('✅ SCHEDULING PROCESS - Attractions Loaded:', {
      totalFound: rankedAttractions.length,
      requestedIds: rankedIds.length,
      matchRate: `${((rankedAttractions.length / rankedIds.length) * 100).toFixed(1)}%`,
      timestamp: new Date().toISOString()
    });

    console.log('📋 SCHEDULING PROCESS - Attraction Details:');
    rankedAttractions.forEach((attraction, index) => {
      console.log(`  ${index + 1}. ${attraction.id}: ${attraction.name} (${attraction.duration}min, ${attraction.opening_hours})`);
    });

    // Create the scheduling prompt
    const attractionDetails = rankedAttractions
      .map(attraction => `${attraction.id}: opening="${attraction.opening_hours}", duration=${attraction.duration}`)
      .join('\n');

    const schedulingPrompt = `CRITICAL: You MUST follow this EXACT format or the schedule will be REJECTED.

TASK: Schedule ${rankedIds.length} attractions across ${days} days.

ATTRACTIONS TO SCHEDULE:
${attractionDetails}

ABSOLUTE RULES (VIOLATION = IMMEDIATE REJECTION):

1. MEAL TIMES (NEVER CHANGE):
   - Breakfast: 08:00-08:30
   - Lunch: 13:00-14:00  
   - Dinner: 20:00-21:00

2. ATTRACTION TIME SLOTS (ONLY THESE ARE ALLOWED):
   - Slot 1: 08:30-10:00 (90 minutes)
   - Slot 2: 11:30-12:30 (60 minutes)
   - Slot 3: 14:00-15:30 (90 minutes)
   - Slot 4: 17:00-18:30 (90 minutes)

3. DAILY STRUCTURE (NEVER DEVIATE):
   - EXACTLY 4 attractions per day
   - 2 morning attractions (slots 1 & 2)
   - 2 afternoon attractions (slots 3 & 4)
   - ALL attractions MUST end before 19:00

4. FORBIDDEN TIMES (ATTRACTIONS CANNOT BE SCHEDULED):
   - Before 08:30 (breakfast conflict)
   - 13:00-14:00 (lunch conflict)
   - After 19:00 (dinner preparation)

MANDATORY OUTPUT FORMAT:

D1
B=08:00-08:30
L=13:00-14:00
D=20:00-21:00
${rankedIds[0]}=08:30-10:00
${rankedIds[1]}=11:30-12:30
${rankedIds[2]}=14:00-15:30
${rankedIds[3]}=17:00-18:30

D2
B=08:00-08:30
L=13:00-14:00
D=20:00-21:00
${rankedIds[4]}=08:30-10:00
${rankedIds[5]}=11:30-12:30
${rankedIds[6]}=14:00-15:30
${rankedIds[7]}=17:00-18:30

D3
B=08:00-08:30
L=13:00-14:00
D=20:00-21:00
${rankedIds[8]}=08:30-10:00
${rankedIds[9]}=11:30-12:30
${rankedIds[10]}=14:00-15:30
${rankedIds[11]}=17:00-18:30

IMPORTANT: Copy this EXACT format with the provided attraction IDs. Do NOT change times, do NOT add extra attractions, do NOT modify meal times.`;

    console.log('🤖 SCHEDULING PROCESS - Calling AI API:', {
      model: 'deepseek/deepseek-chat-v3.1:free',
      attractionsCount: rankedIds.length,
      days,
      promptLength: schedulingPrompt.length,
      timestamp: new Date().toISOString()
    });

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

    console.log('📡 SCHEDULING PROCESS - AI API Response:', {
      status: response.status,
      statusText: response.statusText,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ SCHEDULING PROCESS - AI API Error:', {
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      });

      // Handle rate limit errors specifically
      if (response.status === 429) {
        const errorData = JSON.parse(errorText);
        const resetTime = errorData.error?.metadata?.headers?.['X-RateLimit-Reset'];
        const resetDate = resetTime ? new Date(parseInt(resetTime)) : null;

        throw new Error(`Rate limit exceeded. ${resetDate ? `Resets at ${resetDate.toLocaleString()}` : 'Please try again later.'}`);
      }

      throw new Error(`AI API request failed: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const schedulingResponse = aiResponse.choices[0]?.message?.content;

    if (!schedulingResponse) {
      throw new Error('No content received from AI API');
    }

    console.log('🎯 SCHEDULING PROCESS - AI Response Received:', {
      responseLength: schedulingResponse.length,
      tokensUsed: aiResponse.usage?.total_tokens || 0,
      timestamp: new Date().toISOString()
    });

    console.log('📝 SCHEDULING PROCESS - Raw AI Response:');
    console.log(schedulingResponse);

    // Parse the scheduling response
    console.log('🔄 SCHEDULING PROCESS - Parsing Schedule...');
    const schedule = parseSchedulingResponse(schedulingResponse, rankedAttractions);

    console.log('✅ SCHEDULING PROCESS - Schedule Parsed Successfully:', {
      daysScheduled: schedule.length,
      totalAttractions: schedule.reduce((count, day) => count + day.attractions.length, 0),
      mealsPerDay: 3,
      timestamp: new Date().toISOString()
    });

    console.log('📅 SCHEDULING PROCESS - Final Schedule:');
    schedule.forEach((day, index) => {
      console.log(`  Day ${day.day}: ${day.attractions.length} attractions`);
      day.attractions.forEach((attraction: any) => {
        console.log(`    - ${attraction.id}: ${attraction.name} (${attraction.time})`);
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        destination,
        days,
        totalAttractions: rankedIds.length,
        scheduledAttractions: schedule.reduce((count, day) => count + day.attractions.length, 0)
      },
      metadata: {
        apiCalls: 1,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        rawResponse: schedulingResponse,
        note: 'Generated using OpenRouter AI API with DeepSeek model'
      }
    });

  } catch (error) {
    console.error('Scheduling API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Parses the raw text response from the AI into a structured schedule object.
 * 
 * @param response - Raw text response from AI.
 * @param attractions - List of attraction details for reference.
 * @returns Structured schedule array.
 */
function parseSchedulingResponse(response: string, attractions: Attraction[]) {
  const lines = response.split('\n').filter(line => line.trim());
  const schedule: any[] = [];
  let currentDay: any = null;

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
    // Parse attractions (format: A0080=08:30-10:00)
    else if (trimmedLine.match(/^A\d+=.+$/)) {
      const match = trimmedLine.match(/^(A\d+)=(.+)$/);
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