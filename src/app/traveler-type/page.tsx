'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * Traveler Type page component.
 * Allows users to select their travel group type (Solo, Couple, Family, Friends).
 */
export default function TravelerTypePage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();

  const travelerTypes = [
    { id: 'solo', name: 'Solo', image: '/images/traveler-types/Solo.png' },
    { id: 'couple', name: 'Couple', image: '/images/traveler-types/Couple.png' },
    { id: 'family', name: 'Family', image: '/images/traveler-types/Family.png' },
    { id: 'friends', name: 'Friends', image: '/images/traveler-types/Friends.png' },
  ];

  // Check if we have the required data
  useEffect(() => {
    // Add a small delay to ensure localStorage has been set
    const checkData = () => {
      const destination = localStorage.getItem('destination');
      const destinations = localStorage.getItem('destinations');
      const startDate = localStorage.getItem('startDate');
      const endDate = localStorage.getItem('endDate');

      console.log('🔍 VALIDATION CHECK - localStorage state:', {
        destination,
        destinations: destinations ? JSON.parse(destinations) : null,
        startDate,
        endDate,
        timestamp: new Date().toISOString(),
        page: 'traveler-type'
      });

      // Check for either single destination or multiple destinations format
      const hasDestination = destination || (destinations && JSON.parse(destinations).length > 0);

      if (!hasDestination || !startDate || !endDate) {
        console.log('❌ VALIDATION FAILED - Missing required data, redirecting to quick-itinerary');
        toast.error('Please complete the previous step first');
        router.push('/quick-itinerary');
      } else {
        console.log('✅ VALIDATION PASSED - All required data present');
      }
    };

    // Small delay to ensure localStorage is set
    const timer = setTimeout(checkData, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleTypeSelect = (typeId: string) => {
    console.log('🧳 USER INPUT - Traveler Type Selection:', {
      selectedType: typeId,
      timestamp: new Date().toISOString(),
      page: 'traveler-type'
    });
    setSelectedType(typeId);
  };

  const handlePrevious = () => {
    router.push('/quick-itinerary');
  };

  const handleNext = () => {
    if (!selectedType) {
      console.log('❌ USER INPUT ERROR - No traveler type selected');
      toast.error('Please select a traveler type');
      return;
    }

    console.log('✅ USER INPUT CONFIRMED - Traveler Type:', {
      selectedType,
      action: 'proceeding_to_budget',
      timestamp: new Date().toISOString()
    });

    // Store the selected traveler type and navigate to the budget page
    localStorage.setItem('travelerType', selectedType);
    toast.success('Proceeding to budget selection');
    router.push('/budget');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Type Of Group
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Select the option that best describes your travel group
          </p>
        </motion.div>

        {/* Traveler Type Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {travelerTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${selectedType === type.id
                ? 'border-orange-500 shadow-xl scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              {selectedType === type.id && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6 overflow-hidden rounded-full bg-white p-1 shadow-sm">
                  <div className="relative w-full h-full overflow-hidden rounded-full border-2 border-orange-300">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  {type.name}
                </h3>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${selectedType === type.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTypeSelect(type.id);
                  }}
                >
                  {selectedType === type.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <button
            onClick={handlePrevious}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-blue-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedType}
            className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedType
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
  );
}