'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Budget constraints based on traveler type
const getBudgetConstraints = (travelerType: string) => {
  switch (travelerType) {
    case 'solo':
    case 'friends':
      return {
        MIN_BUDGET: 500,
        MAX_BUDGET: 10000,
        LABEL: 'per person per day'
      };
    case 'couple':
      return {
        MIN_BUDGET: 1000,
        MAX_BUDGET: 20000,
        LABEL: 'per couple per day'
      };
    case 'family':
      return {
        MIN_BUDGET: 2000,
        MAX_BUDGET: 40000,
        LABEL: 'per family per day'
      };
    default:
      return {
        MIN_BUDGET: 500,
        MAX_BUDGET: 10000,
        LABEL: 'per person per day'
      };
  }
};

const getDefaultBudgetRange = (travelerType: string) => {
  const constraints = getBudgetConstraints(travelerType);
  return {
    min: Math.max(constraints.MIN_BUDGET, Math.floor(constraints.MIN_BUDGET * 1.5)),
    max: Math.min(constraints.MAX_BUDGET, Math.floor(constraints.MAX_BUDGET * 0.4))
  };
};

/**
 * Budget page component.
 * Allows users to set their daily budget based on their traveler type.
 */
export default function BudgetPage() {
  const router = useRouter();
  const [travelerType, setTravelerType] = useState<string>('');
  const [dailyBudget, setDailyBudget] = useState<number>(2000);
  const [budgetConstraints, setBudgetConstraints] = useState(getBudgetConstraints('solo'));

  useEffect(() => {
    // Add a small delay to ensure localStorage has been set
    const checkData = () => {
      const storedTravelerType = localStorage.getItem('travelerType');

      console.log('🔍 VALIDATION CHECK - Budget page localStorage state:', {
        travelerType: storedTravelerType,
        timestamp: new Date().toISOString(),
        page: 'budget'
      });

      if (storedTravelerType) {
        setTravelerType(storedTravelerType);

        // Update budget constraints based on traveler type
        const constraints = getBudgetConstraints(storedTravelerType);
        setBudgetConstraints(constraints);

        // Load stored daily budget or set default based on traveler type
        const storedDailyBudget = localStorage.getItem('dailyBudget');
        if (storedDailyBudget) {
          setDailyBudget(parseInt(storedDailyBudget));
        } else {
          const defaultRange = getDefaultBudgetRange(storedTravelerType);
          const defaultBudget = Math.round((defaultRange.min + defaultRange.max) / 2);
          setDailyBudget(defaultBudget);
        }

        console.log('✅ VALIDATION PASSED - Budget page data loaded successfully');
      } else {
        console.log('❌ VALIDATION FAILED - No traveler type found, redirecting');
        toast.error('Please select traveler type first');
        window.location.href = '/traveler-type';
      }
    };

    // Small delay to ensure localStorage is set
    const timer = setTimeout(checkData, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateBudgetRange = (min: number, max: number, constraints = budgetConstraints): boolean => {
    return min >= constraints.MIN_BUDGET &&
      max <= constraints.MAX_BUDGET &&
      min < max;
  };

  const handleBudgetChange = (value: number) => {
    console.log('💰 USER INPUT - Budget Selection:', {
      selectedBudget: value,
      travelerType,
      budgetCategory: value <= 1500 ? 'economy' : value <= 4000 ? 'moderate' : 'luxury',
      timestamp: new Date().toISOString(),
      page: 'budget'
    });

    setDailyBudget(value);
    localStorage.setItem('dailyBudget', value.toString());

    // Store budget category for backward compatibility
    const budgetCategory = value <= 1500 ? 'economy' :
      value <= 4000 ? 'moderate' : 'luxury';
    localStorage.setItem('budgetType', budgetCategory);

    // Store as range format for backward compatibility
    const budgetRange = { min: value - 500, max: value + 500 };
    localStorage.setItem('budgetRange', JSON.stringify(budgetRange));
  };

  const handleNext = () => {
    if (dailyBudget < budgetConstraints.MIN_BUDGET || dailyBudget > budgetConstraints.MAX_BUDGET) {
      console.log('❌ USER INPUT ERROR - Budget out of range:', {
        selectedBudget: dailyBudget,
        minAllowed: budgetConstraints.MIN_BUDGET,
        maxAllowed: budgetConstraints.MAX_BUDGET,
        travelerType
      });
      toast.error('Please set a valid budget within the allowed range');
      return;
    }

    console.log('✅ USER INPUT CONFIRMED - Budget:', {
      finalBudget: dailyBudget,
      travelerType,
      budgetCategory: dailyBudget <= 1500 ? 'economy' : dailyBudget <= 4000 ? 'moderate' : 'luxury',
      action: 'proceeding_to_category',
      timestamp: new Date().toISOString()
    });

    // Navigate to category page with daily budget
    const params = new URLSearchParams({
      travelerType,
      budget: dailyBudget.toString()
    });

    router.push(`/category?${params.toString()}`);
  };

  const handlePrevious = () => {
    window.location.href = '/traveler-type';
  };

  if (!travelerType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
        

      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Budget
            </h1>
            <p className="text-xl text-gray-700 mb-2 font-medium">
              Set your daily budget {budgetConstraints.LABEL}
            </p>
            <p className="text-lg text-gray-600 capitalize flex items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm">
                <svg className="w-5 h-5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                {travelerType} Traveler
              </span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white shadow-sm">
                ₹{budgetConstraints.MIN_BUDGET.toLocaleString()} - ₹{budgetConstraints.MAX_BUDGET.toLocaleString()}
              </span>
            </p>
          </motion.div>

          {/* Main Budget Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 mb-8"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Set Your Daily Budget
              </h2>
              <p className="text-gray-600 text-lg">
                Adjust the slider to set your preferred budget per person per day
              </p>
            </div>



            {/* Enhanced Budget Slider */}
            <div className="mb-10 px-2">
              <label className="block text-sm font-semibold text-gray-700 mb-6 text-center text-lg">
                Daily Budget: <span className="text-purple-600">₹{dailyBudget.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min={budgetConstraints.MIN_BUDGET}
                max={budgetConstraints.MAX_BUDGET}
                value={dailyBudget}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #667eea 0%, #764ba2 ${((dailyBudget - budgetConstraints.MIN_BUDGET) / (budgetConstraints.MAX_BUDGET - budgetConstraints.MIN_BUDGET)) * 100}%, #E5E7EB ${((dailyBudget - budgetConstraints.MIN_BUDGET) / (budgetConstraints.MAX_BUDGET - budgetConstraints.MIN_BUDGET)) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-sm font-medium text-gray-600 mt-3">
                <span className="px-3 py-1 bg-gray-100 rounded-full">₹{budgetConstraints.MIN_BUDGET.toLocaleString()}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">₹{budgetConstraints.MAX_BUDGET.toLocaleString()}</span>
              </div>
            </div>

            {/* Enhanced Budget Category Cards */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Budget Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Economy Card */}
                <motion.div
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${dailyBudget <= 1500
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-200'
                    : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${dailyBudget <= 1500 ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`font-bold text-lg mb-1 ${dailyBudget <= 1500 ? 'text-green-700' : 'text-gray-700'
                      }`}>Economy</h4>
                    <p className={`text-sm font-medium ${dailyBudget <= 1500 ? 'text-green-600' : 'text-gray-500'
                      }`}>≤₹1,500</p>
                    <p className="text-xs text-gray-500 mt-2">Budget-friendly travel</p>
                  </div>
                </motion.div>

                {/* Moderate Card */}
                <motion.div
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${dailyBudget > 1500 && dailyBudget <= 4000
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-200'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${dailyBudget > 1500 && dailyBudget <= 4000 ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className={`font-bold text-lg mb-1 ${dailyBudget > 1500 && dailyBudget <= 4000 ? 'text-blue-700' : 'text-gray-700'
                      }`}>Moderate</h4>
                    <p className={`text-sm font-medium ${dailyBudget > 1500 && dailyBudget <= 4000 ? 'text-blue-600' : 'text-gray-500'
                      }`}>₹1,501-₹4,000</p>
                    <p className="text-xs text-gray-500 mt-2">Comfortable experience</p>
                  </div>
                </motion.div>

                {/* Luxury Card */}
                <motion.div
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${dailyBudget > 4000
                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-400 shadow-lg shadow-purple-200'
                    : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${dailyBudget > 4000 ? 'bg-purple-500' : 'bg-gray-300'
                      }`}>
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <h4 className={`font-bold text-lg mb-1 ${dailyBudget > 4000 ? 'text-purple-700' : 'text-gray-700'
                      }`}>Luxury</h4>
                    <p className={`text-sm font-medium ${dailyBudget > 4000 ? 'text-purple-600' : 'text-gray-500'
                      }`}>{'>'}₹4,000</p>
                    <p className="text-xs text-gray-500 mt-2">Premium indulgence</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

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
              disabled={dailyBudget < budgetConstraints.MIN_BUDGET || dailyBudget > budgetConstraints.MAX_BUDGET}
              className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${dailyBudget >= budgetConstraints.MIN_BUDGET && dailyBudget <= budgetConstraints.MAX_BUDGET
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