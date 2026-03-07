import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { executeAIWorkflow, convertToItineraryFormat, UserPreferences } from '@/lib/ai/workflow';

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
    const {
      destinations,
      destination, // for backward compatibility
      duration, // for single destination requests
      tripDuration = 2,
      totalDays,
      startDate,
      endDate,
      budget = 'moderate',
      themes = [],
      travelerType = 'family',
      category,
      age = 35
    } = body;

    console.log('🚀 BACKEND API - AI Itinerary Request Received:', {
      destinations: destinations?.length || 0,
      destination,
      startDate,
      endDate,
      travelerType,
      budget,
      category,
      themes,
      totalDays,
      timestamp: new Date().toISOString()
    });

    // Handle both new multiple destinations format and legacy single destination
    let destinationList = [];
    if (destinations && Array.isArray(destinations)) {
      // Map destinations to ensure consistent property names
      destinationList = destinations.map(dest => ({
        name: dest.destination || dest.name,
        days: dest.days || 2
      }));
    } else if (destination) {
      // Legacy single destination format - use duration if provided, otherwise tripDuration
      const days = duration || tripDuration;
      destinationList = [{ name: destination, days: days }];
    }

    if (destinationList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one destination is required' },
        { status: 400 }
      );
    }

    // Calculate total days from date range if not provided
    let calculatedTotalDays = totalDays;
    if (!calculatedTotalDays && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      calculatedTotalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    if (!calculatedTotalDays) {
      calculatedTotalDays = destinationList.reduce((sum, dest) => sum + (dest.days || 2), 0);
    }

    // Combine themes with category if provided
    let allThemes = Array.isArray(themes) ? [...themes] : [];
    if (category && !allThemes.includes(category)) {
      allThemes.push(category);
    }

    console.log('📊 BACKEND API - Processing Parameters:', {
      calculatedTotalDays,
      destinationCount: destinationList.length,
      combinedThemes: allThemes,
      timestamp: new Date().toISOString()
    });

    // Note: UserPreferences interface expects single destination, so we'll process each destination separately

    // Path to attractions CSV
    const csvPath = path.join(process.cwd(), 'data', 'attractions-database.csv');

    // Handle multiple destinations by processing each one
    const results = [];
    let totalTokensUsed = 0;
    let totalApiCalls = 0;

    for (const dest of destinationList) {
      const destPreferences: UserPreferences = {
        type_of_group: travelerType,
        destination: dest.name,
        age: typeof age === 'number' ? age : 35,
        budget,
        themes: allThemes,
        days: dest.days || 2
      };

      console.log('🎯 BACKEND API - Processing Destination:', {
        destination: dest.name,
        days: dest.days,
        travelerType,
        budget,
        themes: allThemes,
        timestamp: new Date().toISOString()
      });

      const workflowResult = await executeAIWorkflow(destPreferences, csvPath);

      console.log('✅ BACKEND API - Workflow Result:', {
        destination: dest.name,
        success: workflowResult.success,
        tokensUsed: workflowResult.metadata?.totalTokensUsed || 0,
        apiCalls: (workflowResult.metadata?.rankingApiCalls || 0) + (workflowResult.metadata?.schedulingApiCalls || 0),
        timestamp: new Date().toISOString()
      });

      if (workflowResult.success && workflowResult.data) {
        const itineraryResult = convertToItineraryFormat(workflowResult);
        results.push({
          destination: dest.name,
          days: dest.days,
          ...itineraryResult
        });
        totalTokensUsed += workflowResult.metadata.totalTokensUsed;
        totalApiCalls += workflowResult.metadata.rankingApiCalls + workflowResult.metadata.schedulingApiCalls;
      } else {
        console.log('❌ BACKEND API - Workflow Failed:', {
          destination: dest.name,
          error: workflowResult.error,
          timestamp: new Date().toISOString()
        });
        results.push({
          destination: dest.name,
          days: dest.days,
          success: false,
          error: workflowResult.error
        });
      }
    }

    // Combine results into a single response
    const combinedItinerary = results.reduce((acc, result) => {
      if (result.itinerary) {
        acc.push(...result.itinerary.map((day: any, index: number) => ({
          ...day,
          destination: result.destination,
          day: acc.length + index + 1
        })));
      }
      return acc;
    }, []);

    const enhancedResponse = {
      success: true,
      destination: destinationList.map(d => d.name).join(', '),
      duration: calculatedTotalDays,
      itinerary: combinedItinerary,
      metadata: {
        totalApiCalls,
        tokensUsed: totalTokensUsed,
        workflowSuccess: true,
        destinations: results.length,
        successfulDestinations: results.filter(r => r.success !== false).length
      }
    };

    // Check if we have any successful results
    const hasSuccessfulResults = results.some(r => r.success !== false && r.itinerary && r.itinerary.length > 0);

    // If no successful results due to rate limits, provide fallback sample data
    if (!hasSuccessfulResults && results.length > 0) {
      const destination = results[0].destination || destinations[0].name;
      const days = destinations[0].days || totalDays;

      console.log('🔄 BACKEND API - Providing fallback sample data due to AI API limitations');

      const fallbackResponse = {
        success: true,
        destination: destination,
        duration: days,
        estimatedCost: 'Sample data - AI temporarily unavailable',
        humorousTitle: `Sample ${destination} Adventure!`,
        summary: `This is sample itinerary data. The AI service has reached its daily free tier limit (50 requests/day). The service will reset in a few hours, or you can add credits to your OpenRouter account for unlimited access.`,
        itinerary: Array.from({ length: days }, (_, dayIndex) => ({
          day: dayIndex + 1,
          date: new Date(new Date(startDate).getTime() + dayIndex * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activities: [
            {
              time: '09:00',
              title: `Morning Exploration in ${destination}`,
              location: `${destination} City Center`,
              description: 'Sample activity - Start your day exploring the local area',
              duration: '2 hours',
              cost: '₹500',
              type: 'attraction',
              coordinates: { lat: 19.0760, lng: 72.8777 }
            },
            {
              time: '12:00',
              title: 'Local Lunch Experience',
              location: `Popular Restaurant in ${destination}`,
              description: 'Sample meal - Enjoy local cuisine',
              duration: '1 hour',
              cost: '₹800',
              type: 'meal',
              coordinates: { lat: 19.0760, lng: 72.8777 }
            },
            {
              time: '15:00',
              title: `Afternoon ${destination} Highlights`,
              location: `${destination} Landmark`,
              description: 'Sample activity - Visit famous local attractions',
              duration: '3 hours',
              cost: '₹1000',
              type: 'attraction',
              coordinates: { lat: 19.0760, lng: 72.8777 }
            }
          ]
        })),
        metadata: {
          totalApiCalls: 0,
          tokensUsed: 0,
          workflowSuccess: false,
          destinations: 1,
          successfulDestinations: 0,
          fallbackUsed: true
        }
      };

      const formattedFallbackResponse = {
        success: true,
        data: {
          ...fallbackResponse,
          dayPlans: fallbackResponse.itinerary
        }
      };

      return NextResponse.json(formattedFallbackResponse);
    }

    // Wrap response in expected format
    const formattedResponse = {
      success: true,
      data: {
        ...enhancedResponse,
        dayPlans: enhancedResponse.itinerary || []
      }
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Error in TravelAI workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate itinerary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}