'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiArrowRight, FiPlus, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';

// Helper function to generate date range
const generateDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

interface Destination {
  id: string;
  name: string;
  days: number;
  startDate: Date;
  endDate: Date;
  color: string;
}

/**
 * Quick Itinerary page component.
 * Allows users to quickly input destinations and dates for itinerary generation.
 */
export default function QuickItinerary() {
  const [destinations, setDestinations] = useState<Destination[]>([{
    id: '1',
    name: '',
    days: 0,
    startDate: new Date(),
    endDate: new Date(),
    color: '#3B82F6'
  }]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentActiveId, setCurrentActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions([]);
      setCurrentActiveId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Calculate total days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(days);

      // Auto-split days between destinations
      if (destinations.length > 0) {
        const daysPerDestination = Math.floor(days / destinations.length);
        const remainingDays = days % destinations.length;

        const updatedDestinations = destinations.map((dest, index) => {
          const destDays = daysPerDestination + (index < remainingDays ? 1 : 0);
          const destStartDate = new Date(startDate);
          const previousDays = destinations.slice(0, index).reduce((sum, d) => sum + d.days, 0);
          destStartDate.setDate(startDate.getDate() + previousDays);

          const destEndDate = new Date(destStartDate);
          destEndDate.setDate(destStartDate.getDate() + destDays - 1);

          return {
            ...dest,
            days: destDays,
            startDate: destStartDate,
            endDate: destEndDate
          };
        });

        setDestinations(updatedDestinations);
      }
    }
  }, [startDate, endDate, destinations.length]);

  const addDestination = () => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const nextColor = colors[destinations.length % colors.length];
    const newDestination: Destination = {
      id: `dest-${destinations.length + 1}`,
      name: '',
      days: 0,
      startDate: new Date(),
      endDate: new Date(),
      color: nextColor
    };

    console.log('➕ USER INPUT - Added Destination:', {
      destinationCount: destinations.length + 1,
      timestamp: new Date().toISOString(),
      page: 'quick-itinerary'
    });

    setDestinations([...destinations, newDestination]);
  };

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(dest => dest.id !== id));
    }
  };

  const updateDestinationName = (id: string, name: string) => {
    console.log('📍 USER INPUT - Destination Name:', {
      destinationId: id,
      destinationName: name,
      timestamp: new Date().toISOString(),
      page: 'quick-itinerary'
    });

    setDestinations(destinations.map(dest =>
      dest.id === id ? { ...dest, name } : dest
    ));
  };

  const updateDestinationDays = (id: string, days: number) => {
    if (days < 1 || days > totalDays) return;

    console.log('📅 USER INPUT - Destination Days:', {
      destinationId: id,
      days: days,
      totalDays: totalDays,
      timestamp: new Date().toISOString(),
      page: 'quick-itinerary'
    });

    const updatedDestinations = destinations.map(dest =>
      dest.id === id ? { ...dest, days } : dest
    );

    // Recalculate dates for all destinations
    let currentDate = new Date(startDate!);
    updatedDestinations.forEach(dest => {
      dest.startDate = new Date(currentDate);
      dest.endDate = new Date(currentDate);
      dest.endDate.setDate(currentDate.getDate() + dest.days - 1);
      currentDate.setDate(currentDate.getDate() + dest.days);
    });

    setDestinations(updatedDestinations);
  };

  const handleStartDateChange = (date: Date | null) => {
    console.log('📅 USER INPUT - Start Date:', {
      startDate: date?.toISOString(),
      timestamp: new Date().toISOString(),
      page: 'quick-itinerary'
    });
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    console.log('📅 USER INPUT - End Date:', {
      endDate: date?.toISOString(),
      timestamp: new Date().toISOString(),
      page: 'quick-itinerary'
    });
    setEndDate(date);
  };

  const handleDestinationChange = async (id: string, value: string) => {
    updateDestinationName(id, value);
    setCurrentActiveId(id);

    if (value.length >= 2) {
      try {
        const response = await fetch(`/api/places/search?query=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (id: string, suggestion: string) => {
    updateDestinationName(id, suggestion);
    setSuggestions([]);
    setCurrentActiveId(null);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validDestinations = destinations.filter(dest => dest.name.trim() !== '');

    if (validDestinations.length === 0 || !startDate || !endDate) {
      console.log('❌ USER INPUT ERROR - Missing required fields:', {
        validDestinations: validDestinations.length,
        hasStartDate: !!startDate,
        hasEndDate: !!endDate,
        timestamp: new Date().toISOString()
      });
      toast.error('Please fill in all required fields');
      return;
    }

    const totalAllocatedDays = destinations.reduce((sum, dest) => sum + dest.days, 0);
    if (totalAllocatedDays !== totalDays) {
      console.log('❌ USER INPUT ERROR - Days allocation mismatch:', {
        totalAllocatedDays,
        totalDays,
        timestamp: new Date().toISOString()
      });
      toast.error('Please allocate all days to destinations');
      return;
    }

    console.log('✅ USER INPUT CONFIRMED - Trip Details:', {
      destinations: validDestinations.map(d => ({ name: d.name, days: d.days })),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalDays,
      action: 'proceeding_to_traveler_type',
      timestamp: new Date().toISOString()
    });

    // Store the data
    localStorage.setItem('destinations', JSON.stringify(validDestinations));
    localStorage.setItem('startDate', startDate.toISOString());
    localStorage.setItem('endDate', endDate.toISOString());
    localStorage.setItem('totalDays', totalDays.toString());

    // For backward compatibility, store the first destination as 'destination'
    localStorage.setItem('destination', validDestinations[0].name);

    toast.success('Proceeding to traveler type selection');
    window.location.href = '/traveler-type';
  };

  return (
    <main className="min-h-screen py-20 bg-light-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Quick AI Itinerary</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us where and when you're traveling, and our AI will create a personalized itinerary for you in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
        >
          <form onSubmit={handleSubmit}>
            {/* Multiple Destinations Section */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-4 flex items-center">
                <FiMapPin className="mr-2 text-accent" />
                Destinations
              </label>

              {destinations.map((destination, index) => (
                <div key={destination.id} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                    <div className="flex-1 w-full relative">
                      <input
                        type="text"
                        value={destination.name}
                        onChange={(e) => handleDestinationChange(destination.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Destination ${index + 1} (e.g., Paris, France)`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        required
                      />
                      {currentActiveId === destination.id && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {suggestions.map((suggestion, i) => (
                            <div
                              key={i}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectSuggestion(destination.id, suggestion);
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>



                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={addDestination}
                        className="flex items-center justify-center w-12 h-12 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-200 hover:scale-105"
                        title="Add destination"
                      >
                        <FiPlus className="text-lg" />
                      </button>

                      {destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDestination(destination.id)}
                          className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 hover:scale-105"
                          title="Remove destination"
                        >
                          <FiX className="text-lg" />
                        </button>
                      )}
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="text-sm text-gray-600">
                      Allocated days:
                      <input
                        type="number"
                        min="1"
                        max={totalDays}
                        value={destination.days}
                        onChange={(e) => updateDestinationDays(destination.id, parseInt(e.target.value) || 0)}
                        className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="ml-4 text-gray-500">
                        ({destination.startDate.toLocaleDateString()} - {destination.endDate.toLocaleDateString()})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FiCalendar className="mr-2 text-accent" />
                  Start Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FiCalendar className="mr-2 text-accent" />
                  End Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  placeholderText="Select end date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  required
                />
              </div>
            </div>

            {totalDays > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between"
              >
                <span className="font-medium">Total Trip Duration:</span>
                <span className="text-xl font-bold">{totalDays} Days</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1"
            >
              Next Step
              <FiArrowRight className="ml-2" />
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
