import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { validateEnvironmentVariables } from '@/lib/config/env-validation';
import { geocodeAddress } from '@/lib/api/geoapify';
import { parseAttractionsCSV, getAttractionsByTheme, getTopRatedAttractions, AttractionData } from '@/lib/data/csv-parser';
import { executeAIWorkflow, convertToItineraryFormat, UserPreferences } from '@/lib/ai/workflow';

// Define types locally since we removed gemini-api.ts
/**
 * Request body for itinerary generation.
 */
export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelerType: string;
  budget: string;
  travelTheme?: string;
  preferences?: string[];
}

export interface Activity {
  time: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  cost: string;
  type: 'attraction' | 'meal' | 'transport' | 'accommodation';
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

/**
 * Structure for the full itinerary response.
 */
export interface ItineraryResponse {
  destination: string;
  totalDays: number;
  estimatedCost: string;
  humorousTitle: string;
  summary: string;
  dayPlans: DayPlan[];
}

// Generate itinerary using real attraction data from CSV
/**
 * Core logic to generate an itinerary using the AI workflow and real CSV data.
 * Calculates duration, formats preferences, and executes the workflow.
 * 
 * @param request - The user request details.
 * @returns The generated itinerary response.
 */
async function generateItineraryWithRealData(request: ItineraryRequest): Promise<ItineraryResponse> {
  try {
    // Calculate days from date range
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Convert request to UserPreferences format
    const userPreferences: UserPreferences = {
      type_of_group: request.travelerType,
      destination: request.destination,
      age: 35, // Default age
      budget: request.budget,
      themes: request.travelTheme ? [request.travelTheme] : [],
      days: days
    };

    // Execute the new AI workflow
    console.log('🎯 BACKEND PROCESS - Starting AI Workflow:', {
      destination: userPreferences.destination,
      travelerType: userPreferences.type_of_group,
      budget: userPreferences.budget,
      themes: userPreferences.themes,
      days: userPreferences.days,
      timestamp: new Date().toISOString()
    });

    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');
    const workflowResult = await executeAIWorkflow(userPreferences, csvPath);

    console.log('✅ BACKEND PROCESS - AI Workflow Result:', {
      destination: userPreferences.destination,
      success: workflowResult.success,
      tokensUsed: workflowResult.metadata?.totalTokensUsed || 0,
      apiCalls: (workflowResult.metadata?.rankingApiCalls || 0) + (workflowResult.metadata?.schedulingApiCalls || 0),
      timestamp: new Date().toISOString()
    });

    if (!workflowResult.success) {
      console.log('❌ BACKEND PROCESS - AI Workflow Failed, Using Fallback:', {
        destination: request.destination,
        error: workflowResult.error,
        timestamp: new Date().toISOString()
      });
      return generateFallbackItinerary(request);
    }

    // Convert to itinerary format
    const apiResponse = convertToItineraryFormat(workflowResult);

    if (!apiResponse.success || !apiResponse.itinerary) {
      throw new Error(apiResponse.error || 'Failed to convert itinerary');
    }

    // Map to ItineraryResponse format
    const dayPlans: DayPlan[] = apiResponse.itinerary.map((day: any) => ({
      day: day.day,
      date: day.date,
      activities: day.activities.map((activity: any) => ({
        time: activity.time,
        title: activity.name,
        location: activity.name, // Use name as location fallback
        description: activity.description || `Experience ${activity.name}`,
        duration: activity.duration || '1 hour',
        cost: getBudgetCost(request.budget, activity.type === 'meal' ? 'meal' : 'attraction'),
        type: activity.type === 'meal' ? 'meal' : 'attraction',
        coordinates: activity.coordinates
      }))
    }));

    const totalCost = calculateTotalCost(dayPlans, request.budget);

    return {
      destination: apiResponse.destination || request.destination,
      totalDays: apiResponse.duration || days,
      estimatedCost: `$${totalCost}`,
      humorousTitle: `${apiResponse.duration || days} Days of ${request.destination} Magic!`,
      summary: `A fantastical ${apiResponse.duration || days}-day journey through ${request.destination} tailored for ${request.travelerType}s.`,
      dayPlans
    };
  } catch (error) {
    console.log('❌ BACKEND PROCESS - AI Workflow Exception:', {
      destination: request.destination,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return generateFallbackItinerary(request);
  }
}

// Helper function to get budget-appropriate costs
function getBudgetCost(budget: string, type: 'attraction' | 'meal' | 'transport' | 'accommodation'): string {
  const budgetMultiplier = budget.toLowerCase().includes('luxury') ? 2 :
    budget.toLowerCase().includes('budget') ? 0.5 : 1;

  const baseCosts = {
    attraction: 25,
    meal: 15,
    transport: 10,
    accommodation: 80
  };

  return `$${Math.round(baseCosts[type] * budgetMultiplier)}`;
}

// Helper function to calculate total cost
function calculateTotalCost(dayPlans: DayPlan[], budget: string): number {
  let total = 0;
  dayPlans.forEach(day => {
    day.activities.forEach(activity => {
      const cost = parseInt(activity.cost.replace('$', ''));
      total += cost;
    });
  });
  return total;
}

// Fallback function if CSV loading fails
function generateFallbackItinerary(request: ItineraryRequest): ItineraryResponse {
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const dayPlans: DayPlan[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    dayPlans.push({
      day: i + 1,
      date: currentDate.toISOString().split('T')[0],
      activities: [
        {
          time: '09:00',
          title: 'Morning Exploration',
          location: `Popular area in ${request.destination}`,
          description: `Explore the highlights of ${request.destination}`,
          duration: '2 hours',
          cost: getBudgetCost(request.budget, 'attraction'),
          type: 'attraction'
        },
        {
          time: '12:00',
          title: 'Local Lunch',
          location: `Restaurant in ${request.destination}`,
          description: 'Enjoy authentic local cuisine',
          duration: '1 hour',
          cost: getBudgetCost(request.budget, 'meal'),
          type: 'meal'
        },
        {
          time: '14:00',
          title: 'Cultural Experience',
          location: `Cultural site in ${request.destination}`,
          description: 'Visit local attractions and immerse in culture',
          duration: '3 hours',
          cost: getBudgetCost(request.budget, 'attraction'),
          type: 'attraction'
        }
      ]
    });
  }

  const totalCost = calculateTotalCost(dayPlans, request.budget);

  return {
    destination: request.destination,
    totalDays: days,
    estimatedCost: `$${totalCost}`,
    humorousTitle: `${days} Days of ${request.destination} Adventures!`,
    summary: `A ${days}-day ${request.budget} trip to ${request.destination} for ${request.travelerType} travelers with amazing experiences.`,
    dayPlans
  };
}

/**
 * POST handler for generating an itinerary.
 * Validates request, checks environment, and executes the generation workflow.
 * 
 * @param request - Next.js request object.
 * @returns JSON response with the itinerary or error.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      return NextResponse.json(
        {
          error: 'API configuration error',
          details: envValidation.errors
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: ItineraryRequest = await request.json();

    console.log('🚀 BACKEND API - Generate Itinerary Request Received:', {
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      travelerType: body.travelerType,
      budget: body.budget,
      travelTheme: body.travelTheme,
      preferences: body.preferences?.length || 0,
      timestamp: new Date().toISOString()
    });
    // Validate required fields
    const requiredFields = ['destination', 'startDate', 'endDate', 'travelerType', 'budget'];
    const missingFields = requiredFields.filter(field => !body[field as keyof ItineraryRequest]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Validate date format and logic
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Please use YYYY-MM-DD format.' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date.' },
        { status: 400 }
      );
    }

    // Check if start date is in the past (compare only dates, not time)
    const today = new Date();
    const todayDateString = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    if (body.startDate < todayDateString) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past.' },
        { status: 400 }
      );
    }

    // Generate itinerary using TravelAI workflow
    console.log('📊 BACKEND API - Starting Itinerary Generation:', {
      destination: body.destination,
      calculatedDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      timestamp: new Date().toISOString()
    });

    const itinerary = await generateItineraryWithRealData(body);

    console.log('✅ BACKEND API - Itinerary Generation Complete:', {
      destination: itinerary.destination,
      totalDays: itinerary.totalDays,
      activitiesCount: itinerary.dayPlans.reduce((total, day) => total + day.activities.length, 0),
      estimatedCost: itinerary.estimatedCost,
      timestamp: new Date().toISOString()
    });

    // Enhance itinerary with location coordinates using Geoapify
    try {
      for (const dayPlan of itinerary.dayPlans) {
        for (const activity of dayPlan.activities) {
          if (activity.location && !activity.coordinates) {
            const coordinates = await geocodeAddress(`${activity.location}, ${itinerary.destination}`);
            if (coordinates) {
              activity.coordinates = coordinates;
            }
          }
        }
      }
    } catch (geocodingError) {
      console.warn('Failed to geocode some locations:', geocodingError);
      // Continue without coordinates - this is not a critical error
    }

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error generating itinerary:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate itinerary. Please try again.' },
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
