'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
// dynamic import removed
import toast from 'react-hot-toast';
import { MapPin, Clock, DollarSign, FileText, Download, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { ItineraryResponse } from '@/app/api/generate-itinerary/route';
import RestaurantReplaceModal from '@/components/itinerary/RestaurantReplaceModal';
import AttractionDetailPanel from '@/components/itinerary/AttractionDetailPanel';
import DayMap from '@/components/itinerary/DayMap';
import { Restaurant } from '@/services/restaurant-service';
import { Coordinates } from '@/lib/api/geoapify';

export interface DayPlan {
    day: number;
    date: string;
    activities: Activity[];
}

export interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    cost: string;
    type: 'attraction' | 'meal' | 'transport' | 'accommodation';
    image?: string;
    coordinates?: Coordinates;
    mealType?: 'breakfast' | 'lunch' | 'dinner';
    restaurantId?: string;
    isDefault?: boolean;
}

interface ItineraryData {
    destination: string;
    totalDays: number;
    estimatedCost: string;
    humorousTitle: string;
    summary: string;
    dayPlans: DayPlan[];
}

interface AttractionImageResponse {
    images: Record<string, string>;
}

// Enhanced dummy data for demonstration
const dummyItinerary: ItineraryData = {
    destination: "Paris",
    totalDays: 5,
    estimatedCost: "$2,500",
    humorousTitle: "Paris: Where Your Wallet Goes to Die (But Your Soul Comes Alive!)",
    summary: "A perfect blend of culture, cuisine, and romance in the City of Light. Experience iconic landmarks, world-class museums, charming neighborhoods, and exquisite French cuisine.",
    dayPlans: [
        {
            day: 1,
            date: "March 15, 2024",
            activities: [
                {
                    id: "1",
                    time: "09:00 AM",
                    title: "Annapurna Cafe",
                    description: "Start your day with a hearty breakfast at this cozy mountain cafe with stunning views.",
                    location: "Hotel Le Marais, 4th Arrondissement",
                    duration: "1.5 hrs",
                    cost: "$25",
                    type: "meal",
                    image: "/images/placeholder.svg",
                    mealType: "breakfast",
                    isDefault: true,
                    coordinates: { lat: 48.8566, lng: 2.3522 }
                },
                {
                    id: "2",
                    time: "11:00 AM",
                    title: "Mountain Trek Adventure",
                    description: "Embark on a scenic mountain trek with breathtaking panoramic views and photo opportunities.",
                    location: "Annapurna Base Camp Trail",
                    duration: "2 hrs",
                    cost: "$45",
                    type: "attraction",
                    image: "/images/placeholder.svg",
                    coordinates: { lat: 48.8584, lng: 2.2945 }
                },
                {
                    id: "3",
                    time: "02:00 PM",
                    title: "Drive: Attraction 1 → Attraction 2",
                    description: "Scenic drive through winding mountain roads with spectacular valley views.",
                    location: "Mountain Highway",
                    duration: "24 mins",
                    cost: "$15",
                    type: "transport",
                    image: "/images/placeholder.svg"
                },
                {
                    id: "4",
                    time: "03:00 PM",
                    title: "Historic Palace Tour",
                    description: "Explore the magnificent architecture and rich history of this ancient palace complex.",
                    location: "Royal Palace Complex",
                    duration: "2 hrs",
                    cost: "$35",
                    type: "attraction",
                    image: "/images/placeholder.svg",
                    coordinates: { lat: 48.8606, lng: 2.3376 }
                },
                {
                    id: "5",
                    time: "07:00 PM",
                    title: "Meghana Cafe",
                    description: "End your day with delicious local cuisine at this highly-rated traditional restaurant.",
                    location: "City Center",
                    duration: "1.5 hrs",
                    cost: "$40",
                    type: "meal",
                    image: "/images/placeholder.svg",
                    mealType: "dinner",
                    isDefault: true,
                    coordinates: { lat: 48.8606, lng: 2.3376 }
                },
                {
                    id: "6",
                    time: "09:00 PM",
                    title: "Hotel",
                    description: "Rest and recharge at this comfortable hotel with modern amenities.",
                    location: "Downtown District",
                    duration: "Overnight",
                    cost: "$80",
                    type: "accommodation",
                    image: "/images/placeholder.svg"
                }
            ]
        },
        {
            day: 2,
            date: "March 16, 2024",
            activities: [
                {
                    id: "6",
                    time: "09:00 AM",
                    title: "Louvre Museum",
                    description: "Discover world-famous artworks including the Mona Lisa and Venus de Milo.",
                    location: "1st Arrondissement",
                    duration: "4 hours",
                    cost: "$20",
                    type: "attraction"
                },
                {
                    id: "7",
                    time: "01:30 PM",
                    title: "Lunch at Angelina",
                    description: "Indulge in their famous hot chocolate and pastries.",
                    location: "Rue de Rivoli",
                    duration: "1 hour",
                    cost: "$25",
                    type: "meal",
                    mealType: "lunch",
                    isDefault: true,
                    coordinates: { lat: 48.8606, lng: 2.3376 }
                },
                {
                    id: "8",
                    time: "03:00 PM",
                    title: "Tuileries Garden",
                    description: "Stroll through the beautiful gardens and enjoy street performers.",
                    location: "1st Arrondissement",
                    duration: "1.5 hours",
                    cost: "$0",
                    type: "attraction"
                },
                {
                    id: "9",
                    time: "05:30 PM",
                    title: "Champs-Elysees Shopping",
                    description: "Shop along the famous avenue and visit the Arc de Triomphe.",
                    location: "8th Arrondissement",
                    duration: "2.5 hours",
                    cost: "$200",
                    type: "attraction"
                },
                {
                    id: "10",
                    time: "08:30 PM",
                    title: "Dinner at L'Ami Jean",
                    description: "Experience modern French cuisine in a cozy atmosphere.",
                    location: "7th Arrondissement",
                    duration: "2 hours",
                    cost: "$95",
                    type: "meal",
                    mealType: "dinner",
                    isDefault: true,
                    coordinates: { lat: 48.8566, lng: 2.2945 }
                }
            ]
        }
        // Additional days would be added here...
    ]
};

/**
 * Itinerary Results page component.
 * Displays the generated itinerary with details on daily activities, costs, and options to download or modify.
 */
export default function ItineraryResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [showSummary, setShowSummary] = useState(false);
    const [travelerData, setTravelerData] = useState({
        travelerType: '',
        budget: '',
        category: '',
        themes: [] as string[]
    });
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Restaurant replace modal state
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [selectedMealActivity, setSelectedMealActivity] = useState<Activity | null>(null);
    const [currentDayActivities, setCurrentDayActivities] = useState<Activity[]>([]);

    // Attraction detail panel state
    const [showAttractionPanel, setShowAttractionPanel] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState<Activity | null>(null);
    const lastImageRequestKeyRef = useRef('');

    const loadAttractionImages = useCallback(async (currentItinerary: ItineraryData) => {
        const attractionTitles = Array.from(
            new Set(
                currentItinerary.dayPlans.flatMap((day) =>
                    day.activities
                        .filter((activity) => activity.type === 'attraction')
                        .map((activity) => activity.title.trim())
                        .filter(Boolean)
                )
            )
        );

        if (attractionTitles.length === 0) return;
        const requestKey = `${currentItinerary.destination.toLowerCase()}::${[...attractionTitles].sort().join('|')}`;
        if (lastImageRequestKeyRef.current === requestKey) return;
        lastImageRequestKeyRef.current = requestKey;

        try {
            const response = await fetch('/api/attraction-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: currentItinerary.destination,
                    attractions: attractionTitles
                })
            });

            if (!response.ok) {
                console.warn('Failed to fetch attraction images for itinerary results.');
                return;
            }

            const data: AttractionImageResponse = await response.json();
            if (!data.images || Object.keys(data.images).length === 0) return;

            setItinerary((previous) => {
                const sourceItinerary = previous ?? currentItinerary;
                return {
                    ...sourceItinerary,
                    dayPlans: sourceItinerary.dayPlans.map((day) => ({
                        ...day,
                        activities: day.activities.map((activity) => {
                            if (activity.type !== 'attraction') return activity;
                            const attractionImage = data.images[activity.title];
                            if (!attractionImage) return activity;
                            return { ...activity, image: attractionImage };
                        })
                    }))
                };
            });
        } catch (error) {
            lastImageRequestKeyRef.current = '';
            console.warn('Error while fetching attraction images from Pexels.', error);
        }
    }, []);

    // Body scroll lock effect
    useEffect(() => {
        if (showSummaryModal || showRestaurantModal || showAttractionPanel) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px'; // Prevent layout shift
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [showSummaryModal, showRestaurantModal, showAttractionPanel]);

    useEffect(() => {
        // Add a small delay to ensure localStorage and URL params are ready
        const checkDataAndLoad = () => {
            // Get travel data from URL params
            const travelerType = searchParams.get('travelerType') || '';
            const budgetParam = searchParams.get('budget') || '';
            const category = searchParams.get('category') || '';
            const themes = searchParams.get('themes')?.split(',') || [];

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

            // Try to get missing data from localStorage if URL params are incomplete
            let finalTravelerType = travelerType;
            let finalBudget = budget;
            let finalCategory = category;
            let finalThemes = themes;

            if (!travelerType) {
                finalTravelerType = localStorage.getItem('travelerType') || '';
            }
            if (!budgetParam) {
                const storedBudget = localStorage.getItem('budget') || '';
                finalBudget = storedBudget;
                // Try to parse stored budget if it's a range
                try {
                    const parsedStoredBudget = JSON.parse(storedBudget);
                    if (parsedStoredBudget.min && parsedStoredBudget.max) {
                        finalBudget = `₹${parsedStoredBudget.min}-₹${parsedStoredBudget.max} per person per day`;
                    }
                } catch {
                    // Use stored budget as is
                }
            }
            if (!category) {
                finalCategory = localStorage.getItem('category') || '';
            }
            if (themes.length === 0) {
                const storedThemes = localStorage.getItem('themes');
                finalThemes = storedThemes ? storedThemes.split(',') : ['all'];
            }

            console.log('🔍 Itinerary Results - Parameter Check:', {
                urlParams: { travelerType, budgetParam, category, themes },
                finalValues: { finalTravelerType, finalBudget, finalCategory, finalThemes }
            });

            // Only redirect if we still don't have essential data
            if (!finalTravelerType || !finalBudget || !finalCategory) {
                console.log('🚨 Missing essential travel data:', { finalTravelerType, finalBudget, finalCategory });
                toast.error('Missing travel data. Redirecting to start.');
                router.push('/traveler-type');
                return;
            }

            setTravelerData({
                travelerType: finalTravelerType,
                budget: finalBudget,
                category: finalCategory,
                themes: finalThemes.length > 0 ? finalThemes : ['all']
            });

            // Load generated itinerary from localStorage
            try {
                const storedItinerary = localStorage.getItem('generatedItinerary');
                if (storedItinerary) {
                    const parsedItinerary: ItineraryResponse = JSON.parse(storedItinerary);

                    // Convert ItineraryResponse to ItineraryData format
                    const convertedItinerary: ItineraryData = {
                        destination: parsedItinerary.destination,
                        totalDays: parsedItinerary.totalDays,
                        estimatedCost: parsedItinerary.estimatedCost,
                        humorousTitle: parsedItinerary.humorousTitle,
                        summary: parsedItinerary.summary,
                        dayPlans: parsedItinerary.dayPlans.map(day => ({
                            day: day.day,
                            date: day.date,
                            activities: day.activities.map((activity, index) => {
                                const convertedActivity: Activity = {
                                    id: `${day.day}-${index}`,
                                    time: activity.time,
                                    title: activity.title,
                                    description: activity.description,
                                    location: activity.location,
                                    duration: activity.duration,
                                    cost: activity.cost,
                                    type: activity.type as 'attraction' | 'meal' | 'transport' | 'accommodation',
                                    image: activity.image || '/images/placeholder.svg'
                                };

                                // Preserve coordinates from API response if available
                                if ('coordinates' in activity && activity.coordinates) {
                                    convertedActivity.coordinates = activity.coordinates;
                                }

                                // Add meal-specific properties for meal activities
                                if (activity.type === 'meal') {
                                    // Infer meal type from description or time
                                    const description = activity.description.toLowerCase();
                                    const time = activity.time.toLowerCase();

                                    let mealType: 'breakfast' | 'lunch' | 'dinner' = 'lunch';
                                    if (description.includes('breakfast') || time.includes('09:') || time.includes('08:') || time.includes('10:')) {
                                        mealType = 'breakfast';
                                    } else if (description.includes('lunch') || time.includes('13:') || time.includes('14:') || time.includes('01:') || time.includes('02:')) {
                                        mealType = 'lunch';
                                    } else if (description.includes('dinner') || time.includes('19:') || time.includes('20:') || time.includes('07:') || time.includes('08:')) {
                                        mealType = 'dinner';
                                    }

                                    convertedActivity.mealType = mealType;
                                    convertedActivity.isDefault = true;
                                    // Use coordinates from API if available, otherwise default
                                    if (!convertedActivity.coordinates) {
                                        convertedActivity.coordinates = { lat: 0, lng: 0 };
                                    }
                                }

                                return convertedActivity;
                            })
                        }))
                    };

                    setItinerary(convertedItinerary);
                    void loadAttractionImages(convertedItinerary);
                } else {
                    // No generated itinerary found - redirect back to generate
                    console.error('🚨 No generated itinerary found in localStorage');
                    toast.error('No itinerary found. Please generate a new one.');
                    router.push('/quick-itinerary');
                    return;
                }
            } catch (error) {
                console.error('Error loading itinerary:', error);
                toast.error('Error loading itinerary. Please generate a new one.');
                router.push('/quick-itinerary');
                return;
            } finally {
                setIsLoading(false);
            }
        };

        // Add a small delay to ensure localStorage is ready
        setTimeout(checkDataAndLoad, 100);
    }, [searchParams, router, loadAttractionImages]);

    const handleDownload = () => {
        const itineraryText = generateItineraryText();
        const blob = new Blob([itineraryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${itinerary?.destination || 'itinerary'}-itinerary.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Itinerary downloaded successfully!');
    };

    const generateItineraryText = () => {
        if (!itinerary) return '';

        let text = `${itinerary.humorousTitle}\n`;
        text += `Destination: ${itinerary.destination}\n`;
        text += `Duration: ${itinerary.totalDays} days\n`;
        text += `Estimated Cost: ${itinerary.estimatedCost}\n`;
        text += `Traveler Type: ${travelerData.travelerType}\n\n`;
        text += `Summary:\n${itinerary.summary}\n\n`;

        itinerary.dayPlans.forEach(day => {
            text += `DAY ${day.day} - ${day.date}\n`;
            text += '='.repeat(30) + '\n';
            day.activities.forEach(activity => {
                text += `${activity.time} - ${activity.title}\n`;
                text += `Location: ${activity.location}\n`;
                text += `Duration: ${activity.duration}\n`;
                text += `${activity.description}\n\n`;
            });
            text += '\n';
        });

        return text;
    };

    // Restaurant replacement functions
    const handleReplaceRestaurant = (activity: Activity) => {
        if (activity.type !== 'meal') return;

        const currentDay = itinerary?.dayPlans.find(day => day.day === selectedDay);
        if (!currentDay) return;

        setSelectedMealActivity(activity);
        setCurrentDayActivities(currentDay.activities);
        setShowRestaurantModal(true);
    };

    const handleSelectRestaurant = (restaurant: Restaurant) => {
        if (!selectedMealActivity || !itinerary) return;

        // Update the activity with new restaurant details
        const updatedItinerary = { ...itinerary };
        const dayIndex = updatedItinerary.dayPlans.findIndex(day => day.day === selectedDay);

        if (dayIndex !== -1) {
            const activityIndex = updatedItinerary.dayPlans[dayIndex].activities.findIndex(
                act => act.id === selectedMealActivity.id
            );

            if (activityIndex !== -1) {
                updatedItinerary.dayPlans[dayIndex].activities[activityIndex] = {
                    ...selectedMealActivity,
                    title: restaurant.name,
                    location: restaurant.address,
                    coordinates: restaurant.coordinates,
                    restaurantId: restaurant.id,
                    isDefault: false,
                    description: `Enjoy ${selectedMealActivity.mealType || 'meal'} at ${restaurant.name}`
                };

                setItinerary(updatedItinerary);
                toast.success(`Restaurant updated to ${restaurant.name}`);
            }
        }

        setShowRestaurantModal(false);
        setSelectedMealActivity(null);
    };

    const getMealType = (activity: Activity): 'breakfast' | 'lunch' | 'dinner' => {
        if (activity.mealType) return activity.mealType;

        // Infer meal type from description or time
        const description = activity.description.toLowerCase();
        if (description.includes('breakfast')) return 'breakfast';
        if (description.includes('lunch')) return 'lunch';
        if (description.includes('dinner')) return 'dinner';

        // Infer from time
        const time = activity.time.toLowerCase();
        if (time.includes('09:') || time.includes('08:') || time.includes('10:')) return 'breakfast';
        if (time.includes('13:') || time.includes('14:') || time.includes('01:') || time.includes('02:')) return 'lunch';
        return 'dinner';
    };

    const getNextAttractionCoordinates = (currentActivity: Activity, activities: Activity[]): Coordinates | undefined => {
        const currentIndex = activities.findIndex(act => act.id === currentActivity.id);

        // Find next attraction after current meal
        for (let i = currentIndex + 1; i < activities.length; i++) {
            if (activities[i].type === 'attraction' && activities[i].coordinates) {
                return activities[i].coordinates;
            }
        }

        return undefined;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'attraction':
                return '🏛️';
            case 'meal':
                return '🍽️';
            case 'transport':
                return '🚗';
            case 'accommodation':
                return '🏨';
            default:
                return '📍';
        }
    };

    // Helper functions for summary modal
    const getDayColor = (dayIndex: number) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600'
        ];
        return colors[dayIndex % colors.length];
    };

    const getActivityBackground = (activity: Activity) => {
        switch (activity.type) {
            case 'attraction':
                return 'bg-blue-50 border-blue-200';
            case 'meal':
                return 'bg-orange-50 border-orange-200';
            case 'accommodation':
                return 'bg-green-50 border-green-200';
            case 'transport':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getActivityTextColor = (activity: Activity) => {
        switch (activity.type) {
            case 'attraction':
                return 'text-blue-800';
            case 'meal':
                return 'text-orange-800';
            case 'accommodation':
                return 'text-green-800';
            case 'transport':
                return 'text-gray-800';
            default:
                return 'text-gray-800';
        }
    };

    const getShortTitle = (title: string) => {
        return title.length > 30 ? title.substring(0, 30) + '...' : title;
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your itinerary...</p>
                </div>
            </div>
        );
    }

    // Show error state if no itinerary
    if (!itinerary) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Itinerary Not Found</h2>
                    <p className="text-gray-600 mb-4">We couldn&apos;t load your itinerary. Please try generating a new one.</p>
                    <button
                        onClick={() => router.push('/traveler-type')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <div className="bg-blue-900 text-white">
                    <div className="container mx-auto px-4 py-4">
                        {/* Header content removed - no Account and settings icons */}
                    </div>
                </div>

                {/* Enhanced Trip Summary Bar */}
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-b border-gray-200">
                    <div className="container mx-auto px-4 py-3">
                        <div className="bg-white rounded-xl border border-gray-500 shadow-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="text-center bg-white rounded-lg p-2 shadow-sm border border-blue-100">
                                        <div className="text-2xl font-bold text-blue-600">{itinerary?.totalDays}</div>
                                        <div className="text-xs text-gray-600 font-medium">Days</div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg p-2 shadow-sm border border-green-100">
                                        <div className="text-2xl font-bold text-green-600">{itinerary?.estimatedCost}</div>
                                        <div className="text-xs text-gray-600 font-medium">Estimated Cost</div>
                                    </div>
                                    <div className="text-center bg-white rounded-lg p-2 shadow-sm border border-purple-100">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {itinerary?.dayPlans.reduce((total, day) =>
                                                total + day.activities.filter(activity => activity.type === 'attraction').length, 0
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 font-medium">Attractions</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowSummaryModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md text-sm"
                                    >
                                        <FileText className="w-4 h-4" />
                                        📋 Summary
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-md border border-gray-200 text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        📥 Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
                        {/* Left Side - Day Navigation and Activities */}
                        <div className="w-full md:w-3/5 max-w-4xl mx-auto md:mx-0">
                            {/* Enhanced Day Navigation */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6 w-full lg:max-w-4xl">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                                        disabled={selectedDay === 1}
                                    >
                                        <ChevronLeft className={`w-5 h-5 ${selectedDay === 1 ? 'text-gray-400' : 'text-gray-700'}`} />
                                    </button>

                                    <div className="flex gap-2">
                                        {itinerary?.dayPlans.map((day) => (
                                            <button
                                                key={day.day}
                                                onClick={() => setSelectedDay(day.day)}
                                                className={`px-5 py-3 rounded-lg font-semibold transition-all shadow-sm ${selectedDay === day.day
                                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                                                    }`}
                                            >
                                                📅 Day {day.day}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setSelectedDay(Math.min(itinerary?.totalDays || 1, selectedDay + 1))}
                                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                                        disabled={selectedDay === (itinerary?.totalDays || 1)}
                                    >
                                        <ChevronRight className={`w-5 h-5 ${selectedDay === (itinerary?.totalDays || 1) ? 'text-gray-400' : 'text-gray-700'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Selected Day Details - Enhanced Timeline */}
                            {(() => {
                                const currentDay = itinerary?.dayPlans.find(day => day.day === selectedDay);
                                if (!currentDay) return null;

                                return (
                                    <motion.div
                                        key={selectedDay}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative"
                                    >
                                        {/* Day Header */}
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl inline-block mb-8 font-bold text-lg shadow-lg">
                                            Day {currentDay.day} • {currentDay.date}
                                        </div>

                                        {/* Timeline Container */}
                                        <div className="relative">
                                            {/* Enhanced Vertical Timeline Line */}
                                            <div className="absolute left-8 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" style={{ height: 'calc(100% - 60px)' }}></div>

                                            <div className="space-y-6">
                                                {currentDay.activities.map((activity, index) => {
                                                    const getActivityIcon = (type: string) => {
                                                        switch (type) {
                                                            case 'meal': return '🍽️';
                                                            case 'attraction': return '🎯';
                                                            case 'transport': return '🚗';
                                                            case 'accommodation': return '🏨';
                                                            default: return '📍';
                                                        }
                                                    };

                                                    const getActivityColor = (type: string) => {
                                                        switch (type) {
                                                            case 'meal': return 'bg-red-500';
                                                            case 'attraction': return 'bg-purple-500';
                                                            case 'transport': return 'bg-blue-500';
                                                            case 'accommodation': return 'bg-green-500';
                                                            default: return 'bg-gray-500';
                                                        }
                                                    };

                                                    return (
                                                        <motion.div
                                                            key={activity.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                                            className="relative pl-20 w-full lg:max-w-4xl"
                                                        >
                                                            {/* Enhanced Timeline Dot with Icon */}
                                                            <div className={`absolute left-6 top-6 w-6 h-6 ${getActivityColor(activity.type)} rounded-full z-10 flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                                                                {getActivityIcon(activity.type)}
                                                            </div>

                                                            {/* Enhanced Activity Cards */}
                                                            {activity.type === 'meal' && (
                                                                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
                                                                    {/* Restaurant Badge */}
                                                                    <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3 font-semibold">
                                                                        🍽️ Restaurant
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-4">
                                                                            {/* Enhanced Thumbnail */}
                                                                            <div className="w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                                                                                <Image
                                                                                    src={activity.image || '/images/placeholder.svg'}
                                                                                    alt={activity.title}
                                                                                    width={56}
                                                                                    height={56}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>

                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <h3 className="font-bold text-gray-900 text-lg">{activity.title}</h3>
                                                                                    <span className="text-green-600 text-sm">🌱</span>
                                                                                </div>
                                                                                <p className="text-blue-600 text-sm font-semibold mb-1">
                                                                                    ({activity.mealType ?
                                                                                        activity.mealType.charAt(0).toUpperCase() + activity.mealType.slice(1) :
                                                                                        'Meal'})
                                                                                </p>
                                                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Clock className="w-4 h-4" />
                                                                                        <span className="font-medium">{activity.time}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="font-medium">{activity.duration}</span>
                                                                                    </div>
                                                                                </div>
                                                                                {activity.isDefault && (
                                                                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full mt-2 font-medium">
                                                                                        📍 Nearby recommendation
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleReplaceRestaurant(activity)}
                                                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium"
                                                                            >
                                                                                Replace
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.type === 'attraction' && (
                                                                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 flex">
                                                                    {/* Left Side - Image Section */}
                                                                    <div className="relative w-1/2 aspect-[4/3] bg-gradient-to-br from-purple-100 to-blue-100">
                                                                        <Image
                                                                            src={activity.image || '/images/placeholder.svg'}
                                                                            alt={activity.title}
                                                                            fill
                                                                            className="object-cover rounded-l-xl"
                                                                        />

                                                                        {/* Map pin overlay at top-left */}
                                                                        <div className="absolute top-3 left-3">
                                                                            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm">
                                                                                <MapPin className="w-4 h-4 text-gray-700" />
                                                                            </div>
                                                                        </div>

                                                                        {/* Time badge at bottom-left */}
                                                                        <div className="absolute bottom-3 left-3">
                                                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                                                                                {activity.time} • {activity.duration}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Right Side - Details Section */}
                                                                    <div className="w-1/2 p-5 flex flex-col justify-between">
                                                                        <div className="space-y-3">
                                                                            {/* Category tag */}
                                                                            <div className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full inline-block font-semibold">
                                                                                🎯 Attraction
                                                                            </div>

                                                                            {/* Title */}
                                                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{activity.title}</h3>

                                                                            {/* Description */}
                                                                            <p className="text-gray-600 text-sm line-clamp-2">{activity.description}</p>

                                                                            {/* Location */}
                                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                                <MapPin className="w-4 h-4" />
                                                                                <span className="font-medium">{activity.location}</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* View More button aligned at bottom right */}
                                                                        <div className="flex justify-end mt-4">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedAttraction(activity);
                                                                                    setShowAttractionPanel(true);
                                                                                }}
                                                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                                                            >
                                                                                View More
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.type === 'transport' && (
                                                                <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
                                                                    <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3 font-semibold">
                                                                        🚗 Travel
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                                                                            </svg>
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <h3 className="font-bold text-gray-900 text-base">{activity.title}</h3>
                                                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Clock className="w-4 h-4" />
                                                                                    <span className="font-medium">{activity.duration}</span>
                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.type === 'accommodation' && (
                                                                <div className="bg-green-50 rounded-xl p-5 shadow-md border border-green-100">
                                                                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3 font-semibold">
                                                                        🏨 Accommodation
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                                                                                <Image
                                                                                    src={activity.image || '/images/placeholder.svg'}
                                                                                    alt={activity.title}
                                                                                    width={56}
                                                                                    height={56}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>

                                                                            <div>
                                                                                <h3 className="font-bold text-gray-900 text-lg">{activity.title}</h3>
                                                                                <p className="text-green-600 text-sm font-semibold">(Stay)</p>
                                                                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                                                    <MapPin className="w-4 h-4" />
                                                                                    <span className="font-medium">{activity.location}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                                                                                Replace
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Connecting line to next item */}
                                                            {index < currentDay.activities.length - 1 && (
                                                                <div className="absolute left-8 top-20 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full opacity-60"></div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}

                                                {/* Hotel Card at the end of each day */}
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: currentDay.activities.length * 0.1 + 0.1 }}
                                                    className="relative pl-20 w-full lg:max-w-4xl"
                                                >
                                                    {/* Enhanced Timeline dot with icon */}
                                                    <div className="absolute left-6 top-6 w-6 h-6 bg-green-500 rounded-full z-10 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                        🏨
                                                    </div>

                                                    {/* Enhanced Hotel Card */}
                                                    <div className="bg-green-50 rounded-xl p-5 shadow-md border border-green-100">
                                                        <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block mb-3 font-semibold">
                                                            🏨 Accommodation
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-14 h-14 rounded-lg overflow-hidden shadow-sm">
                                                                    <Image
                                                                        src="/images/placeholder.svg"
                                                                        alt="Hotel"
                                                                        width={56}
                                                                        height={56}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 text-lg">Hotel</h3>
                                                                    <p className="text-green-600 text-sm font-semibold">(Stay)</p>
                                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="font-medium">City Center</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium">
                                                                    Replace
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </div>

                        {/* Right Side - Enhanced Map Section */}
                        <div className="w-full md:w-2/5 max-w-4xl mx-auto md:mx-0">
                            <div className="sticky bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ top: 'calc(50vh - 300px)', maxHeight: '600px', minHeight: '500px' }}>
                                {/* Enhanced Map Header */}
                                <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                        🗺️ Day Map Preview
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="font-semibold text-gray-700">Day Colors:</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                                            <span className="text-gray-600 font-medium">Day 1</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                                            <span className="text-gray-600 font-medium">Day 2</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                                            <span className="text-gray-600 font-medium">Day 3</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                                            <span className="text-gray-600 font-medium">Day 4+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Map */}
                                <div className="relative">
                                    <DayMap
                                        activities={itinerary?.dayPlans[selectedDay - 1]?.activities || []}
                                        selectedDay={selectedDay}
                                        apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>




            </div>

            {/* Modals rendered outside main container for proper z-index */}
            {showSummaryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button - Positioned within panel */}
                        <button
                            onClick={() => setShowSummaryModal(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 z-50 shadow-lg"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto max-h-[80vh]" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                            {/* Trip Overview Cards */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Overview</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600">Destination</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800">{itinerary?.destination}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600">Duration</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800">{itinerary?.totalDays} days</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600">Traveler Type</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800">solo</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-600">Estimated Cost</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800">{itinerary?.estimatedCost}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mb-6">
                                <p className="text-gray-600 leading-relaxed">{itinerary?.summary}</p>
                            </div>

                            {/* Day-by-day overview */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {itinerary?.dayPlans.map((day, dayIndex) => {
                                        const sortedActivities = [...day.activities].sort((a, b) => {
                                            // Sort by accommodation first (end of day)
                                            if (a.type === 'accommodation' && b.type !== 'accommodation') return -1;
                                            if (b.type === 'accommodation' && a.type !== 'accommodation') return 1;

                                            // Then sort meals by type
                                            if (a.type === 'meal' && b.type === 'meal') {
                                                const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 };
                                                return (mealOrder[a.mealType as keyof typeof mealOrder] || 4) -
                                                    (mealOrder[b.mealType as keyof typeof mealOrder] || 4);
                                            }

                                            return 0;
                                        });

                                        return (
                                            <div key={day.day} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all duration-300">
                                                {/* Clean Day Header */}
                                                <div className="mb-5">
                                                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getDayColor(dayIndex)} text-white font-semibold text-base shadow-sm mb-2`}>
                                                        Day {day.day}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-gray-800 text-lg">{day.date}</h4>
                                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                            {sortedActivities.length} activities
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Chronological Timeline */}
                                                <div className="space-y-3 relative">
                                                    {/* Timeline line */}
                                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full"></div>

                                                    {sortedActivities.map((activity, activityIndex) => (
                                                        <div key={activity.id} className="relative flex items-start gap-4">
                                                            {/* Timeline dot/number */}
                                                            <div className="relative z-10 flex-shrink-0">
                                                                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                                                    {activityIndex + 1}
                                                                </div>
                                                            </div>

                                                            {/* Activity card */}
                                                            <div className={`flex-1 p-3 rounded-xl border ${getActivityBackground(activity)} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                                                                        <span className="text-sm">{getActivityIcon(activity)}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className={`font-medium text-sm ${getActivityTextColor(activity)} truncate`}>
                                                                            {getShortTitle(activity.title)}
                                                                        </h5>
                                                                        <p className="text-xs text-gray-500 truncate">{activity.location}</p>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <span className="text-xs font-medium text-gray-600">{activity.time}</span>
                                                                        <p className="text-xs text-gray-500">{activity.duration}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Restaurant Replace Modal */}
            {showRestaurantModal && selectedMealActivity && (
                <RestaurantReplaceModal
                    isOpen={showRestaurantModal}
                    onClose={() => {
                        setShowRestaurantModal(false);
                        setSelectedMealActivity(null);
                    }}
                    currentCoordinates={selectedMealActivity.coordinates || { lat: 0, lng: 0 }}
                    nextCoordinates={getNextAttractionCoordinates(selectedMealActivity, itinerary?.dayPlans.find(day => day.day === selectedDay)?.activities || [])}
                    mealType={getMealType(selectedMealActivity)}
                    currentRestaurantName={selectedMealActivity.title}
                    onSelectRestaurant={handleSelectRestaurant}
                />
            )}

            {/* Attraction Detail Panel */}
            {showAttractionPanel && selectedAttraction && (
                <AttractionDetailPanel
                    isOpen={showAttractionPanel}
                    onClose={() => {
                        setShowAttractionPanel(false);
                        setSelectedAttraction(null);
                    }}
                    attraction={selectedAttraction}
                />
            )}
        </>
    );
}
