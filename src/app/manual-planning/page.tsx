'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiList, FiPlus, FiArrowRight } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Manual Planning page component.
 * step-by-step form for users to manually input travel details and preferences.
 */
export default function ManualPlanning() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [preferences, setPreferences] = useState({
    museums: false,
    nature: false,
    food: false,
    shopping: false,
    nightlife: false,
    history: false,
  });
  const [budget, setBudget] = useState('medium');
  const [step, setStep] = useState(1);

  const handlePreferenceChange = (preference: string) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference as keyof typeof prev]
    }));
  };

  const handleNextStep = () => {
    if (step === 1 && (!destination || !startDate || !endDate)) {
      alert('Please fill in all required fields');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call your API to generate the itinerary
    console.log('Form submitted:', { destination, startDate, endDate, preferences, budget });
    // Redirect to results page or show results
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
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Manual Planning</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build your perfect itinerary step by step with AI assistance. Customize every detail to match your travel style.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {i === 1 ? <FiMapPin /> : i === 2 ? <FiList /> : <FiCalendar />}
                </div>
                <span className={`mt-2 text-sm ${step >= i ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {i === 1 ? 'Destination & Dates' : i === 2 ? 'Preferences' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <form onSubmit={handleSubmit}>
              {/* Step 1: Destination & Dates */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-6">Where and when are you traveling?</h2>

                  <div className="mb-6">
                    <label htmlFor="destination" className="block text-gray-700 font-medium mb-2 flex items-center">
                      <FiMapPin className="mr-2 text-accent" />
                      Destination
                    </label>
                    <input
                      type="text"
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Paris, France"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2 flex items-center">
                        <FiCalendar className="mr-2 text-accent" />
                        Start Date
                      </label>
                      <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={new Date()}
                        placeholderText="Select start date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2 flex items-center">
                        <FiCalendar className="mr-2 text-accent" />
                        End Date
                      </label>
                      <DatePicker
                        id="endDate"
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || new Date()}
                        placeholderText="Select end date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Preferences */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-6">What are your travel preferences?</h2>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Interests (Select all that apply)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.keys(preferences).map((pref) => (
                        <div
                          key={pref}
                          onClick={() => handlePreferenceChange(pref)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${preferences[pref as keyof typeof preferences] ? 'border-accent bg-accent/10' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${preferences[pref as keyof typeof preferences] ? 'border-accent' : 'border-gray-300'}`}>
                              {preferences[pref as keyof typeof preferences] && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                            </div>
                            <span className="ml-2 capitalize">{pref}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Budget</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['budget', 'medium', 'luxury'].map((b) => (
                        <div
                          key={b}
                          onClick={() => setBudget(b)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${budget === b ? 'border-accent bg-accent/10' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-center">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${budget === b ? 'border-accent' : 'border-gray-300'}`}>
                              {budget === b && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                            </div>
                            <span className="ml-2 capitalize">{b}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-6">Review Your Trip Details</h2>

                  <div className="bg-light-bg p-6 rounded-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Destination</h3>
                        <p className="text-primary font-semibold">{destination}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Dates</h3>
                        <p className="text-primary font-semibold">
                          {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                          <span className="text-gray-500 font-normal ml-2">
                            ({Math.ceil((endDate?.getTime() || 0 - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)) + 1} days)
                          </span>
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(preferences)
                            .filter((entry) => entry[1])
                            .map(([key]) => (
                              <span key={key} className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm capitalize">
                                {key}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Budget</h3>
                        <p className="text-primary font-semibold capitalize">{budget}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                )}

                <div className="ml-auto">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-accent flex items-center"
                    >
                      Next
                      <FiArrowRight className="ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-accent flex items-center"
                    >
                      Create Itinerary
                      <FiPlus className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
