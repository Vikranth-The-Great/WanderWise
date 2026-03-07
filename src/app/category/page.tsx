'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  image: string;
}

const categoryOptions = {
  solo: [
    { id: 'youth', name: 'Youth', description: '13 – 25 years', image: '/images/categories/Category/Solo Young.png' },
    { id: 'adults', name: 'Adults', description: '26 – 40 years', image: '/images/categories/Category/Solo Adult.png' },
    { id: 'middle-age', name: 'Middle Age', description: '41 – 60 years', image: '/images/categories/Category/Solo Middlgeage.png' },
    { id: 'senior', name: 'Senior Travelers', description: '61+ years', image: '/images/categories/Category/Solo Senior.png' }
  ],
  friends: [
    { id: 'youth', name: 'Youth Group', description: '13 – 25 years', image: '/images/categories/Category/Young Friends.png' },
    { id: 'adults', name: 'Adult Friends', description: '26 – 40 years', image: '/images/categories/Category/Adult Age Friends.png' },
    { id: 'middle-age', name: 'Middle Age Friends', description: '41 – 60 years', image: '/images/categories/Category/Middleage Friends.png' },
    { id: 'senior', name: 'Senior Friends', description: '61+ years', image: '/images/categories/Category/Old age Friends.png' }
  ],
  couple: [
    { id: 'young-couple', name: 'Young Couple', description: '18–30 years', image: '/images/categories/Category/Young Couple.png' },
    { id: 'mid-age-couple', name: 'Mid-age Couple', description: '31–50 years', image: '/images/categories/Category/Middleage Couple.png' },
    { id: 'senior-couple', name: 'Senior Couple', description: '51+ years', image: '/images/categories/Category/Old Couple.png' }
  ],
  family: [
    { id: '3-member', name: '3 Member Family', description: 'Small family unit', image: '/images/categories/Category/3 member family.png' },
    { id: '4-member', name: '4 Member Family', description: 'Standard family size', image: '/images/categories/Category/4 member family.png' },
    { id: '5-member', name: '5 Member Family', description: 'Large family unit', image: '/images/categories/Category/5 member family.png' }
  ]
};

/**
 * Category page component.
 * Allows users to select a specific category based on their traveler type (e.g., Age group for Solo).
 */
export default function CategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [travelerType, setTravelerType] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [currentOptions, setCurrentOptions] = useState<CategoryOption[]>([]);
  const [groupSize, setGroupSize] = useState<number>(4);

  useEffect(() => {
    const type = searchParams.get('travelerType');
    const budgetParam = searchParams.get('budget');

    if (!type || !budgetParam) {
      toast.error('Missing required information. Redirecting to start.');
      router.push('/traveler-type');
      return;
    }

    setTravelerType(type);
    setBudget(budgetParam);

    // Set options based on traveler type
    const options = categoryOptions[type as keyof typeof categoryOptions];
    if (options) {
      setCurrentOptions(options);
      if (type === 'family') {
        setSelectedCategory('4-member');
      }
    } else {
      toast.error('Invalid traveler type');
      router.push('/traveler-type');
    }
  }, [searchParams, router]);

  const handleCategorySelect = (categoryId: string) => {
    console.log('👥 USER INPUT - Category Selection:', {
      selectedCategory: categoryId,
      travelerType,
      budget,
      timestamp: new Date().toISOString(),
      page: 'category'
    });
    setSelectedCategory(categoryId);
  };

  const handleNext = () => {
    if (!selectedCategory) {
      console.log('❌ USER INPUT ERROR - No category selected');
      toast.error('Please select a category to continue');
      return;
    }

    console.log('✅ USER INPUT CONFIRMED - Category:', {
      selectedCategory,
      travelerType,
      budget,
      action: 'proceeding_to_themes',
      timestamp: new Date().toISOString()
    });

    // Navigate to travel theme page with all collected data
    const params = new URLSearchParams({
      travelerType,
      budget,
      category: selectedCategory
    });

    if (travelerType === 'family' || travelerType === 'friends') {
      params.append('groupSize', groupSize.toString());
      localStorage.setItem('groupSize', groupSize.toString());
    }

    router.push(`/travel-theme?${params.toString()}`);
  };

  const handlePrevious = () => {
    const params = new URLSearchParams({
      travelerType
    });
    router.push(`/budget?${params.toString()}`);
  };

  const getPageTitle = () => {
    switch (travelerType) {
      case 'solo':
      case 'friends':
        return 'Age Category';
      case 'couple':
        return 'Couple Category';
      case 'family':
        return 'Family Size';
      default:
        return 'Category';
    }
  };

  const getPageDescription = () => {
    switch (travelerType) {
      case 'solo':
        return 'Select your age group for personalized recommendations';
      case 'friends':
        return 'Choose the age group that best represents your friend group';
      case 'couple':
        return 'Select the category that best describes your relationship stage';
      case 'family':
        return 'Choose your family size for tailored travel suggestions';
      default:
        return 'Select the option that best describes your situation';
    }
  };

  if (!travelerType || currentOptions.length === 0) {
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
    <>
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.6);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.6);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {getPageDescription()}
            </p>
          </motion.div>

          {/* Slider for Family or Friends */}
          {(travelerType === 'family' || travelerType === 'friends') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12 max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {travelerType === 'family' ? 'Family Size' : 'Number of Friends'}
                </h2>
                <p className="text-gray-600">
                  Adjust the slider to set the number of people in your group
                </p>
              </div>

              <div className="px-4">
                <label className="block text-center text-xl font-bold text-blue-900 mb-6">
                  {groupSize} People
                </label>
                <input
                  type="range"
                  min="2"
                  max={travelerType === 'family' ? "10" : "15"}
                  value={groupSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    setGroupSize(size);
                    if (travelerType === 'family') {
                      setSelectedCategory(`${size}-member`);
                    }
                  }}
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #fb923c ${((groupSize - 2) / ((travelerType === 'family' ? 10 : 15) - 2)) * 100}%, #E5E7EB ${((groupSize - 2) / ((travelerType === 'family' ? 10 : 15) - 2)) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-sm font-medium text-gray-500 mt-4">
                  <span>2 People</span>
                  <span>{travelerType === 'family' ? '10 People' : '15 People'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Category Options */}
          {travelerType !== 'family' && (
            <div className={`grid md:grid-cols-2 gap-6 mb-12 ${(travelerType === 'solo' || travelerType === 'friends')
              ? 'lg:grid-cols-4'
              : 'lg:grid-cols-3'
              }`}>
              {currentOptions.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${selectedCategory === option.id
                    ? 'border-orange-500 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                    }`}
                  onClick={() => handleCategorySelect(option.id)}
                >
                  {selectedCategory === option.id && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-6 overflow-hidden rounded-2xl">
                      <Image
                        src={option.image}
                        alt={option.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-2xl"
                      />
                    </div>

                    <h3 className="text-2xl font-bold text-blue-900 mb-2">
                      {option.name}
                    </h3>

                    <p className="text-gray-600 mb-6">
                      {option.description}
                    </p>

                    <button
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === option.id
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect(option.id);
                      }}
                    >
                      {selectedCategory === option.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

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

            <button
              onClick={handleNext}
              disabled={!selectedCategory}
              className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedCategory
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}