import { NextResponse } from 'next/server';
import { validateEnvironmentVariables } from '@/lib/config/env-validation';
import { geocodeAddress, searchPlaces } from '@/lib/api/geoapify';

/**
 * GET handler to test API connectivity and environment configuration.
 * Checks Geoapify integration and environment variables.
 * 
 * @returns JSON object with test results.
 */
interface GeocodingResult {
  success?: boolean;
  error?: string;
  testAddress?: string;
  coordinates?: unknown;
}

interface PlacesSearchResult {
  success?: boolean;
  error?: string;
  testQuery?: string;
  testCoordinates?: { lat: number; lng: number };
  placesFound?: number;
  samplePlace?: unknown;
}

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        validation: validateEnvironmentVariables()
      },
      geoapify: {
        status: 'unknown',
        error: null as string | null,
        geocoding: null as GeocodingResult | null,
        placesSearch: null as PlacesSearchResult | null
      }
    };



    // Test Geoapify Geocoding API
    try {
      const testAddress = 'Times Square, New York, NY';
      const coordinates = await geocodeAddress(testAddress);

      results.geoapify.geocoding = {
        testAddress,
        coordinates,
        success: coordinates !== null
      };
    } catch (error) {
      results.geoapify.geocoding = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test Geoapify Places Search API
    try {
      const testQuery = '';
      const testCoordinates = { lat: 40.7128, lng: -74.0060 }; // NYC coordinates
      const places = await searchPlaces(testQuery, testCoordinates, 1000, ['catering.restaurant']);

      results.geoapify.placesSearch = {
        testQuery,
        testCoordinates,
        placesFound: places.length,
        success: places.length > 0,
        samplePlace: places[0] || null
      };
    } catch (error) {
      results.geoapify.placesSearch = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Determine overall Geoapify status
    const geocodingSuccess = results.geoapify.geocoding?.success === true;
    const placesSuccess = results.geoapify.placesSearch?.success === true;

    if (geocodingSuccess && placesSuccess) {
      results.geoapify.status = 'success';
    } else if (geocodingSuccess || placesSuccess) {
      results.geoapify.status = 'partial';
    } else {
      results.geoapify.status = 'error';
      results.geoapify.error = 'Both geocoding and places search failed';
    }

    // Overall status
    const overallStatus = {
      allApisWorking: results.geoapify.status === 'success',
      environmentValid: results.environment.validation.isValid,
      summary: {
        geoapify: results.geoapify.status,
        environment: results.environment.validation.isValid ? 'valid' : 'invalid'
      }
    };

    return NextResponse.json({
      ...results,
      overall: overallStatus
    });

  } catch (error) {
    console.error('Error in API test:', error);
    return NextResponse.json(
      {
        error: 'Failed to run API tests',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
