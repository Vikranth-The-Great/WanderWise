import { NextRequest, NextResponse } from 'next/server';
import {
  buildItinerary,
  buildItineraryLegacy,
  DayWindow,
  Attraction,
  OpeningHours,
  ScheduledAttraction,
  VisitPlan
} from '@/lib/scheduling/attraction-scheduler';
import { parseAttractionsCSV, convertToAttractionFormat, convertToOpeningHoursFormat, getAttractionsByTheme, getTopRatedAttractions } from '@/lib/data/csv-parser';

// Request interface
/**
 * Request body for attraction recommendations.
 */
interface RecommendAttractionsRequest {
  startDate: string;     // ISO date string
  endDate: string;       // ISO date string
  dailyStartTime?: string; // "09:00" - optional, defaults to "09:00"
  dailyEndTime?: string;   // "18:00" - optional, defaults to "18:00"
  attractions?: Attraction[]; // optional, uses sample data if not provided
  openingHours?: OpeningHours[]; // optional, uses sample data if not provided
  themes?: string[]; // optional, for filtering attractions
}

// Response interface
interface RecommendAttractionsResponse {
  success: boolean;
  schedule: Record<string, ScheduledAttraction[]> | VisitPlan[][];
  totalDays: number;
  totalAttractions: number;
  message?: string;
  useNewAlgorithm?: boolean;
}

/**
 * POST handler for recommending attractions.
 * Generates an itinerary based on time windows and clustering.
 * 
 * @param request - Next.js request object.
 * @returns JSON response with the recommended schedule.
 */
export async function POST(request: NextRequest) {
  try {
    const body: RecommendAttractionsRequest = await request.json();

    // Validate required fields
    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          schedule: {},
          totalDays: 0,
          totalAttractions: 0,
          message: 'Start date and end date are required'
        } as RecommendAttractionsResponse,
        { status: 400 }
      );
    }

    // Parse dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          schedule: {},
          totalDays: 0,
          totalAttractions: 0,
          message: 'Invalid date format. Please use ISO date strings.'
        } as RecommendAttractionsResponse,
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          schedule: {},
          totalDays: 0,
          totalAttractions: 0,
          message: 'Start date must be before end date'
        } as RecommendAttractionsResponse,
        { status: 400 }
      );
    }

    // Default values
    const dailyStartTime = body.dailyStartTime || '09:00';
    const dailyEndTime = body.dailyEndTime || '18:00';

    // Load real attraction data from CSV
    const csvData = parseAttractionsCSV();

    if (csvData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          schedule: {},
          totalDays: 0,
          totalAttractions: 0,
          message: 'Failed to load attraction data from CSV file'
        } as RecommendAttractionsResponse,
        { status: 500 }
      );
    }

    // Filter attractions by themes if provided
    let filteredAttractions = csvData;
    if (body.themes && body.themes.length > 0) {
      filteredAttractions = getAttractionsByTheme(csvData, body.themes);
    }

    // Get top rated attractions (limit to reasonable number for scheduling)
    const topAttractions = getTopRatedAttractions(filteredAttractions, 30);

    // Convert to the format expected by the scheduler
    const attractions = convertToAttractionFormat(topAttractions);
    const openingHours = convertToOpeningHoursFormat(topAttractions).map(item => ({
      attractionId: item.attractionId,
      monday: item.monday,
      tuesday: item.tuesday,
      wednesday: item.wednesday,
      thursday: item.thursday,
      friday: item.friday,
      saturday: item.saturday,
      sunday: item.sunday
    }));

    // Generate day windows
    const days: DayWindow[] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
      days.push({
        date: new Date(currentDate),
        startTime: dailyStartTime,
        endTime: dailyEndTime
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Build itinerary using the new algorithm
    const numDays = days.length;
    const schedule = buildItinerary(attractions, numDays);

    // Calculate statistics
    const totalDays = numDays;
    const totalAttractions = schedule.reduce(
      (sum, daySchedule) => sum + daySchedule.length,
      0
    );

    return NextResponse.json({
      success: true,
      schedule,
      totalDays,
      totalAttractions,
      useNewAlgorithm: true,
      message: `Successfully scheduled ${totalAttractions} attractions across ${totalDays} days using new clustering algorithm`
    } as RecommendAttractionsResponse);

  } catch (error) {
    console.error('Error in recommend-attractions API:', error);
    return NextResponse.json(
      {
        success: false,
        schedule: {},
        totalDays: 0,
        totalAttractions: 0,
        message: 'Internal server error while generating recommendations'
      } as RecommendAttractionsResponse,
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Export types for use in other files
export type { RecommendAttractionsRequest, RecommendAttractionsResponse };