'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface TravelTheme {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

const travelThemes: TravelTheme[] = [
  {
    id: 'all',
    name: 'All',
    description: 'Complete travel experience',
    image: '/images/themes/Travel Themes/All.png',
    icon: '🌍'
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'Nature and scenic landscapes',
    image: '/images/themes/Travel Themes/Natural.png',
    icon: '🌿'
  },
  {
    id: 'cultural',
    name: 'Cultural',
    description: 'Local traditions and customs',
    image: '/images/themes/Travel Themes/Cultural.png',
    icon: '🎭'
  },
  {
    id: 'historical',
    name: 'Historical',
    description: 'Ancient sites and heritage',
    image: '/images/themes/Travel Themes/Historical.png',
    icon: '🏛️'
  },
  {
    id: 'architectural',
    name: 'Architectural',
    description: 'Buildings and structures',
    image: '/images/themes/Travel Themes/Architectural.png',
    icon: '🏗️'
  },
  {
    id: 'religious',
    name: 'Religious/Spiritual',
    description: 'Sacred places and spirituality',
    image: '/images/themes/Travel Themes/Spiritual.png',
    icon: '🕉️'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Shows, parks, and fun activities',
    image: '/images/themes/Travel Themes/Entertainent.png',
    icon: '🎪'
  },
  {
    id: 'adventure',
    name: 'Adventure/Outdoor',
    description: 'Thrilling outdoor activities',
    image: '/images/themes/Travel Themes/Adventure.png',
    icon: '🏔️'
  },
  {
    id: 'wildlife',
    name: 'Wildlife',
    description: 'Animals and nature reserves',
    image: '/images/themes/Travel Themes/Wildlife.png',
    icon: '🦁'
  },
  {
    id: 'museums',
    name: 'Museums & Educational',
    description: 'Learning and discovery',
    image: '/images/themes/Travel Themes/Museum.png',
    icon: '🏛️'
  },
  {
    id: 'shopping',
    name: 'Shopping & Culinary',
    description: 'Food and shopping experiences',
    image: '/images/themes/Travel Themes/Shopping.png',
    icon: '🛍️'
  },
  {
    id: 'events',
    name: 'Events & Festivals',
    description: 'Celebrations and gatherings',
    image: '/images/themes/Travel Themes/Events & Festivals.png',
    icon: '🎉'
  },
  {
    id: 'beach',
    name: 'Beach & Coastal',
    description: 'Sun, sand, and seaside',
    image: '/images/themes/Travel Themes/Beach.png',
    icon: '🏖️'
  },
  {
    id: 'urban',
    name: 'Urban Exploration',
    description: 'City life and modern attractions',
    image: '/images/themes/Travel Themes/Urban Exploration.png',
    icon: '🏙️'
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    description: 'Peaceful retreats and wellness',
    image: '/images/themes/Travel Themes/Relaxation.png',
    icon: '🧘‍♀️'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium experiences',
    image: '/images/themes/Travel Themes/Luxury.png',
    icon: '💎'
  }
];

/**
 * Travel Theme page component.
 * Allows users to select preferred travel themes (e.g., Adventure, Relaxation, Cultural).
 */
export default function TravelThemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [travelerType, setTravelerType] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [groupSize, setGroupSize] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get('travelerType');
    const budgetParam = searchParams.get('budget');
    const categoryParam = searchParams.get('category');
    const groupSizeParam = searchParams.get('groupSize');

    if (!type || !budgetParam || !categoryParam) {
      toast.error('Missing required information. Redirecting to start.');
      router.push('/traveler-type');
      return;
    }

    setTravelerType(type);
    setBudget(budgetParam);
    setCategory(categoryParam);
    if (groupSizeParam) {
      setGroupSize(groupSizeParam);
    }
  }, [searchParams, router]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemes(prev => {
      let newThemes: string[];
      if (themeId === 'all') {
        // If 'All' is selected, select all themes or deselect all if already selected
        if (prev.includes('all')) {
          newThemes = [];
        } else {
          newThemes = travelThemes.map(theme => theme.id);
        }
      } else {
        // For other themes, toggle selection
        if (prev.includes(themeId)) {
          // Remove the theme and also remove 'all' if it was selected
          newThemes = prev.filter(id => id !== themeId && id !== 'all');
        } else {
          // Add the theme, and check if all themes are now selected
          const newSelection = [...prev.filter(id => id !== 'all'), themeId];
          if (newSelection.length === travelThemes.length - 1) {
            // All themes except 'all' are selected, so add 'all'
            newThemes = travelThemes.map(theme => theme.id);
          } else {
            newThemes = newSelection;
          }
        }
      }

      console.log('🎯 USER INPUT - Theme Selection:', {
        selectedTheme: themeId,
        allSelectedThemes: newThemes,
        travelerType,
        budget,
        category,
        timestamp: new Date().toISOString(),
        page: 'travel-theme'
      });

      return newThemes;
    });
  };

  const handleNext = () => {
    if (selectedThemes.length === 0) {
      console.log('❌ USER INPUT ERROR - No themes selected');
      toast.error('Please select at least one travel theme to continue');
      return;
    }

    // Filter out the 'all' theme ID before sending to API
    const actualThemes = selectedThemes.filter(theme => theme !== 'all');

    console.log('✅ USER INPUT CONFIRMED - Travel Themes:', {
      selectedThemes,
      actualThemes,
      travelerType,
      budget,
      category,
      action: 'proceeding_to_generate_itinerary',
      timestamp: new Date().toISOString()
    });

    // Navigate to itinerary generation with all collected data
    const params = new URLSearchParams({
      travelerType,
      budget,
      category,
      themes: actualThemes.join(',')
    });

    if (groupSize) {
      params.append('groupSize', groupSize);
    }

    router.push(`/generate-itinerary?${params.toString()}`)
  };

  const handlePrevious = () => {
    const params = new URLSearchParams({
      travelerType,
      budget
    });
    router.push(`/category?${params.toString()}`);
  };

  if (!travelerType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Travel Theme
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Choose your preferred travel style and interests
          </p>
          <div className="text-sm text-gray-500 mt-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full mr-2">
              {travelerType.charAt(0).toUpperCase() + travelerType.slice(1)}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full mr-2">
              {budget.charAt(0).toUpperCase() + budget.slice(1)} Budget
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </motion.div>

        {/* Travel Theme Options - Custom Layout */}
        <div className="mb-12">
          {/* All Theme Card - Top Row */}
          {(() => {
            const allTheme = travelThemes.find(theme => theme.id === 'all');
            if (!allTheme) return null;
            return (
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -2 }}
                  className={`relative bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-150 cursor-pointer w-48 ${selectedThemes.includes(allTheme.id)
                    ? 'border-orange-500 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                    }`}
                  style={{ height: '192px' }} // 1 * 192px (w-48) - square
                  onClick={() => handleThemeSelect(allTheme.id)}
                >
                  {selectedThemes.includes(allTheme.id) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="text-center h-full flex flex-col">
                    <div className="relative w-full h-32 mx-auto mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={allTheme.image}
                        alt={allTheme.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                      <div className="absolute top-2 left-2 text-2xl">
                        {allTheme.icon}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-blue-900 mb-2">
                      {allTheme.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {allTheme.description}
                    </p>

                    <button
                      className={`w-full py-2 px-2 rounded-lg font-semibold text-sm transition-all duration-300 ${selectedThemes.includes(allTheme.id)
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeSelect(allTheme.id);
                      }}
                    >
                      {selectedThemes.includes(allTheme.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}

          {/* Other Theme Cards - 5 per row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {travelThemes.filter(theme => theme.id !== 'all').map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (index + 1) * 0.02 }}
                whileHover={{ y: -2 }}
                className={`relative bg-white rounded-2xl p-3 shadow-lg border-2 transition-all duration-150 cursor-pointer h-full ${selectedThemes.includes(theme.id)
                  ? 'border-orange-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                  }`}

                onClick={() => handleThemeSelect(theme.id)}
              >
                {selectedThemes.includes(theme.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                <div className="text-center h-full flex flex-col">
                  <div className="relative w-full h-40 mx-auto mb-2 overflow-hidden rounded-xl">
                    <Image
                      src={theme.image}
                      alt={theme.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    <div className="absolute top-2 left-2 text-lg">
                      {theme.icon}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-blue-900 mb-1">
                    {theme.name}
                  </h3>

                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-grow">
                    {theme.description}
                  </p>

                  <button
                    className={`w-full py-1 px-1 rounded-lg font-semibold text-xs transition-all duration-300 ${selectedThemes.includes(theme.id)
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme.id);
                    }}
                  >
                    {selectedThemes.includes(theme.id) ? 'Selected' : 'Select'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={handlePrevious}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-blue-900 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <motion.button
            onClick={handleNext}
            disabled={selectedThemes.length === 0}
            className={`relative flex items-center px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${selectedThemes.length > 0
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-2xl hover:shadow-3xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            whileHover={selectedThemes.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedThemes.length > 0 ? { scale: 0.95 } : {}}
          >
            {selectedThemes.length > 0 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl opacity-75"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.75, 0.9, 0.75]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            <span className="relative z-10 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Itinerary
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}