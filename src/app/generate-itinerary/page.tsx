'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ItineraryResponse } from '@/app/api/generate-itinerary/route';
// Updated to use AI-powered itinerary generation

interface LoadingStep {
  id: number;
  message: string;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  { id: 1, message: 'Collecting preferences', duration: 2000 },
  { id: 2, message: 'Analyzing attraction data', duration: 3000 },
  { id: 3, message: 'AI is crafting your perfect itinerary', duration: 4000 },
  { id: 4, message: 'Optimizing routes with AI', duration: 3500 },
  { id: 5, message: 'Finalizing AI-powered itinerary', duration: 2000 }
];

/**
 * Generate Itinerary page component.
 * Handles the AI generation process, displaying progress steps and redirecting to results.
 */
export default function GenerateItineraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  // Removed map animation - directly redirect to results
  const [progress, setProgress] = useState(0);
  const [travelerData, setTravelerData] = useState({
    travelerType: '',
    budget: '',
    category: '',
    themes: [] as string[],
    groupSize: ''
  });
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Function to validate request data before sending to API
  const validateRequestData = (requestData: any) => {
    const errors = [];

    // Check for destinations array (new format) or single destination (legacy)
    if (!requestData.destinations || !Array.isArray(requestData.destinations) || requestData.destinations.length === 0) {
      if (!requestData.destination || requestData.destination.trim() === '') {
        errors.push('At least one destination is required');
      }
    }

    if (!requestData.startDate || !requestData.endDate) {
      errors.push('Travel dates are required');
    }

    if (new Date(requestData.startDate) >= new Date(requestData.endDate)) {
      errors.push('End date must be after start date');
    }

    if (!requestData.travelerType || requestData.travelerType.trim() === '') {
      errors.push('Traveler type is required');
    }

    if (!requestData.budget || requestData.budget.trim() === '') {
      errors.push('Budget information is required');
    }

    if (!requestData.themes || requestData.themes.length === 0) {
      errors.push('At least one theme must be selected');
    }

    return errors;
  };

  // Function to generate itinerary using AI API
  const generateItinerary = async (requestData: any) => {
    try {
      // Validate request data first
      const validationErrors = validateRequestData(requestData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Log user input details for debugging
      console.log('🎯 FRONTEND: User Input Details:', {
        destinations: requestData.destinations,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        travelerType: requestData.travelerType,
        budget: requestData.budget,
        themes: requestData.themes,
        category: requestData.category
      });

      console.log('🎯 FRONTEND: Making API request to /api/ai-itinerary...');

      const response = await fetch('/api/ai-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate AI itinerary';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Log the complete API response for debugging
      console.log('🎯 FRONTEND: Complete API Response:', JSON.stringify(result, null, 2));

      // Validate the response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }

      if (result.success && result.data) {
        // The AI API returns data in a different format, transform it to ItineraryResponse
        const apiData = result.data;

        console.log('🎯 FRONTEND: API Data Structure:', {
          hasData: !!apiData,
          dataKeys: Object.keys(apiData),
          hasDayPlans: !!apiData.dayPlans,
          dayPlansLength: apiData.dayPlans ? apiData.dayPlans.length : 0,
          hasItinerary: !!apiData.itinerary,
          itineraryLength: apiData.itinerary ? apiData.itinerary.length : 0
        });

        // Extract day plans from the API response
        let dayPlans = [];
        if (apiData.dayPlans && Array.isArray(apiData.dayPlans)) {
          dayPlans = apiData.dayPlans;
          console.log('🎯 FRONTEND: Using dayPlans from API response, count:', dayPlans.length);
        } else if (apiData.itinerary && Array.isArray(apiData.itinerary)) {
          // Handle alternative structure
          dayPlans = apiData.itinerary;
          console.log('🎯 FRONTEND: Using itinerary from API response, count:', dayPlans.length);
        }

        console.log('🎯 FRONTEND: Final dayPlans array:', dayPlans);

        if (dayPlans.length === 0) {
          console.error('🚨 FRONTEND: No day plans found in API response. API Data:', apiData);
          throw new Error('No day plans found in API response');
        }

        // Check if this is fallback sample data
        if (apiData.metadata && apiData.metadata.fallbackUsed) {
          console.log('ℹ️ FRONTEND: Using fallback sample data due to AI API limitations');
          // Show user-friendly notification
          alert('📋 Sample Itinerary\n\nThe AI service has reached its daily free limit. You are viewing sample data to explore the features.\n\nThe service will reset in a few hours, or you can upgrade for unlimited access.');
        }

        // Transform the response to match ItineraryResponse format
        const transformedItinerary = {
          destination: apiData.destination || 'Unknown',
          totalDays: apiData.totalDays || apiData.duration || dayPlans.length,
          estimatedCost: apiData.estimatedCost || 'Not specified',
          humorousTitle: apiData.humorousTitle || `Amazing ${apiData.destination} Adventure!`,
          summary: apiData.summary || `Discover the best of ${apiData.destination} with this carefully crafted itinerary.`,
          dayPlans: dayPlans.map((day, index) => {
            // Use start date from search params or a stable fallback
            const startDate = searchParams.get('startDate') || '2024-03-15';
            const baseDate = new Date(startDate);
            const dayDate = new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000);

            return {
              day: day.day || index + 1,
              date: day.date || dayDate.toISOString().split('T')[0],
              activities: (day.activities || []).map((activity) => ({
                time: activity.time || '09:00',
                title: activity.name || activity.title || 'Activity',
                location: activity.location || 'Location',
                description: activity.description || `${activity.type === 'meal' ? 'Meal time' : 'Attraction visit'} - ${activity.name || 'Activity'}`,
                duration: activity.duration ? `${activity.duration} minutes` : '1 hour',
                cost: activity.cost || '₹0',
                type: activity.type || 'attraction',
                coordinates: activity.coordinates || { lat: 0, lng: 0 }
              }))
            };
          })
        };

        setGeneratedItinerary(transformedItinerary);

        // Store the generated itinerary in localStorage immediately
        localStorage.setItem('generatedItinerary', JSON.stringify(transformedItinerary));
        console.log('✅ FRONTEND: Stored itinerary in localStorage:', transformedItinerary.destination);

        return transformedItinerary;
      } else {
        throw new Error(result.error || 'AI itinerary generation failed - no data returned');
      }
    } catch (error) {
      console.error('Error generating AI itinerary:', error);

      // Provide user-friendly error messages
      let userMessage = 'An unexpected error occurred while generating your itinerary.';

      if (error instanceof Error) {
        if (error.message.includes('Validation failed')) {
          userMessage = error.message;
        } else if (error.message.includes('fetch')) {
          userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Invalid JSON')) {
          userMessage = 'The AI service returned an invalid response. Please try again.';
        } else {
          userMessage = error.message;
        }
      }

      setApiError(userMessage);
      toast.error(userMessage);
      throw error;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure localStorage has been set
    const checkDataAndGenerate = () => {
      // Get travel data from URL params and localStorage
      const travelerType = searchParams.get('travelerType') || '';
      const budgetParam = searchParams.get('budget') || '';
      const category = searchParams.get('category') || '';
      const themes = searchParams.get('themes')?.split(',') || [];
      const groupSize = searchParams.get('groupSize') || localStorage.getItem('groupSize') || '';

      // Parse budget - it could be a range (JSON string) or legacy budget type
      let budget = budgetParam;
      try {
        const parsedBudget = JSON.parse(budgetParam);
        if (parsedBudget.min && parsedBudget.max) {
          // New budget range format
          budget = `₹${parsedBudget.min}-₹${parsedBudget.max} per person per day`;
        }
      } catch {
        // Legacy budget format or invalid JSON, use as is
      }

      // Get destinations and dates from localStorage
      const destinationsStr = localStorage.getItem('destinations') || '';
      const startDate = localStorage.getItem('startDate') || '';
      const endDate = localStorage.getItem('endDate') || '';
      const totalDays = parseInt(localStorage.getItem('totalDays') || '0');

      let destinations = [];
      try {
        destinations = destinationsStr ? JSON.parse(destinationsStr) : [];
      } catch (error) {
        console.error('Error parsing destinations:', error);
        destinations = [];
      }

      // For backward compatibility, also check single destination
      const singleDestination = localStorage.getItem('destination') || '';
      if (destinations.length === 0 && singleDestination) {
        destinations = [{ name: singleDestination, days: totalDays || 2 }];
      }

      // Try to get missing data from localStorage if URL params are missing
      let finalTravelerType = travelerType;
      let finalBudget = budget;
      let finalCategory = category;
      let finalThemes = themes;

      if (!travelerType) {
        finalTravelerType = localStorage.getItem('travelerType') || '';
      }
      if (!budgetParam) {
        finalBudget = localStorage.getItem('budget') || '';
      }
      if (!category) {
        finalCategory = localStorage.getItem('category') || '';
      }
      if (themes.length === 0) {
        const storedThemes = localStorage.getItem('themes');
        finalThemes = storedThemes ? storedThemes.split(',').filter(theme => theme !== 'all') : [];
        // If no themes after filtering, use some default themes
        if (finalThemes.length === 0) {
          finalThemes = ['adventure', 'cultural', 'natural'];
        }
      }

      console.log('🔍 VALIDATION CHECK - Generate itinerary localStorage state:', {
        destinations,
        startDate,
        endDate,
        finalTravelerType,
        finalBudget,
        finalCategory,
        finalThemes,
        timestamp: new Date().toISOString(),
        page: 'generate-itinerary'
      });

      // Only redirect if we still don't have essential data
      if (!finalTravelerType || !finalBudget || !finalCategory) {
        console.log('❌ VALIDATION FAILED - Missing travel preferences:', { finalTravelerType, finalBudget, finalCategory });
        toast.error('Missing travel preferences. Redirecting to start.');
        router.push('/traveler-type');
        return;
      }

      if (destinations.length === 0 || !startDate || !endDate) {
        console.log('❌ VALIDATION FAILED - Missing destination or dates:', { destinations, startDate, endDate });
        toast.error('Missing destination or dates. Redirecting to start.');
        router.push('/quick-itinerary');
        return;
      }

      console.log('✅ VALIDATION PASSED - All required data present, starting itinerary generation');

      setTravelerData({ travelerType: finalTravelerType, budget: finalBudget, category: finalCategory, themes: finalThemes, groupSize });

      // Store data for redirect (to ensure it's available when redirect happens)
      const redirectData = { finalTravelerType, finalBudget, finalCategory, finalThemes, groupSize };

      // Start the loading sequence and API call
      let stepIndex = 0;
      let totalDuration = 0;
      const totalStepDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
      let apiCalled = false;

      const processSteps = async () => {
        if (stepIndex < loadingSteps.length) {
          setCurrentStep(stepIndex);

          // Update progress
          const stepProgress = (totalDuration / totalStepDuration) * 100;
          setProgress(stepProgress);

          // Call AI API during the middle steps
          if (stepIndex === 2 && !apiCalled) {
            apiCalled = true;
            try {
              const enhancedTravelerType = groupSize
                ? `${finalTravelerType} (Group Size: ${groupSize})`
                : finalTravelerType;

              const aiItineraryRequest = {
                destinations,
                startDate,
                endDate,
                travelerType: enhancedTravelerType,
                budget: finalBudget,
                category: finalCategory,
                themes: finalThemes,
                totalDays
              };

              await generateItinerary(aiItineraryRequest);
            } catch (error) {
              // Stop the loading process if API fails
              console.error('Failed to generate AI itinerary:', error);
              setIsComplete(true);
              setProgress(100);
              return; // Exit early to prevent further processing
            }
          }

          setTimeout(() => {
            totalDuration += loadingSteps[stepIndex].duration;
            stepIndex++;
            processSteps();
          }, loadingSteps[stepIndex].duration);
        } else {
          setProgress(100);
          setIsComplete(true);

          // Redirect directly to results page after successful generation
          setTimeout(() => {
            if (!apiError) {
              handleRedirectToResults(redirectData.finalTravelerType, redirectData.finalBudget, redirectData.finalCategory, redirectData.finalThemes);
            }
          }, 1500);
        }
      };

      processSteps();
    };

    // Add a small delay to ensure localStorage is ready
    setTimeout(checkDataAndGenerate, 100);
  }, [searchParams, router]);

  const handleRedirectToResults = (finalTravelerType?: string, finalBudget?: string, finalCategory?: string, finalThemes?: string[]) => {
    // Itinerary is already stored in localStorage during generation

    // Use passed parameters or fall back to travelerData state
    const redirectTravelerType = finalTravelerType || travelerData.travelerType;
    const redirectBudget = finalBudget || travelerData.budget;
    const redirectCategory = finalCategory || travelerData.category;
    const redirectThemes = finalThemes || travelerData.themes;

    console.log('🔄 REDIRECT TO RESULTS - Using data:', {
      redirectTravelerType,
      redirectBudget,
      redirectCategory,
      redirectThemes,
      timestamp: new Date().toISOString()
    });

    const params = new URLSearchParams({
      travelerType: redirectTravelerType,
      budget: redirectBudget,
      category: redirectCategory,
      themes: redirectThemes.join(',')
    });
    router.push(`/itinerary-results?${params.toString()}`);
  };

  const handleRetry = () => {
    setApiError(null);
    setIsComplete(false);
    setCurrentStep(0);
    setProgress(0);
    window.location.reload();
  };

  // Removed convertToAttractionPoints function - no longer needed

  // Removed map animation - directly redirect to results

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Main Loading Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center"
        >
          {/* Logo/Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Creating Your Perfect Itinerary
          </h1>

          <p className="text-gray-600 mb-8">
            Sit back while we craft your personalized travel experience
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Current Step Message */}
          <AnimatePresence mode="wait">
            {!isComplete && currentStep < loadingSteps.length && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <p className="text-lg font-semibold text-blue-800">
                  {loadingSteps[currentStep]?.message}
                </p>
                <div className="flex justify-center mt-3">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        className="w-2 h-2 bg-orange-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: dot * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {isComplete && !apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  Itinerary Ready!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting to your personalized travel plan...
                </p>
              </motion.div>
            )}

            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  Generation Failed
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  {apiError}
                </p>
                <button
                  onClick={handleRetry}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Travel Preferences Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Preferences</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                {travelerData.travelerType.charAt(0).toUpperCase() + travelerData.travelerType.slice(1)}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                {travelerData.budget.charAt(0).toUpperCase() + travelerData.budget.slice(1)} Budget
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                {travelerData.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {travelerData.themes.length > 0 && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                  {travelerData.themes.length} Theme{travelerData.themes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => {
            const positions = [
              { left: '10%', top: '20%' },
              { left: '80%', top: '10%' },
              { left: '20%', top: '80%' },
              { left: '90%', top: '70%' },
              { left: '60%', top: '30%' },
              { left: '30%', top: '60%' }
            ];
            const durations = [3, 4, 3.5, 4.5, 3.2, 3.8];
            const delays = [0, 0.5, 1, 1.5, 0.3, 0.8];

            return (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-white/10 rounded-full"
                style={{
                  left: positions[i].left,
                  top: positions[i].top,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: durations[i],
                  repeat: Infinity,
                  delay: delays[i]
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}