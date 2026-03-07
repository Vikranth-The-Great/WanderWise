'use client';

import { useState } from 'react';
import { RecommendAttractionsRequest, RecommendAttractionsResponse } from '@/app/api/recommend-attractions/route';
import { ScheduledAttraction } from '@/lib/scheduling/attraction-scheduler';

/**
 * Test Attractions page component.
 * A developer tool to test the attraction recommendation algorithm with custom parameters.
 */
export default function TestAttractionsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendAttractionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    startDate: '2025-01-20',
    endDate: '2025-01-22',
    dailyStartTime: '09:00',
    dailyEndTime: '18:00'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/recommend-attractions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: RecommendAttractionsResponse = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Attraction Recommendation Algorithm Test
        </h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Parameters</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Start Time
              </label>
              <input
                type="time"
                value={formData.dailyStartTime}
                onChange={(e) => setFormData({ ...formData, dailyStartTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily End Time
              </label>
              <input
                type="time"
                value={formData.dailyEndTime}
                onChange={(e) => setFormData({ ...formData, dailyEndTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating Recommendations...' : 'Get Attraction Recommendations'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-800">
                <h3 className="text-sm font-medium">Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recommendation Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <span className="font-medium text-blue-800">Total Days:</span>
                  <span className="ml-2 text-blue-600">{result.totalDays}</span>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <span className="font-medium text-green-800">Total Attractions:</span>
                  <span className="ml-2 text-green-600">{result.totalAttractions}</span>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <span className="font-medium text-purple-800">Status:</span>
                  <span className="ml-2 text-purple-600">{result.success ? 'Success' : 'Failed'}</span>
                </div>
              </div>
              {result.message && (
                <p className="text-gray-600 mt-3">{result.message}</p>
              )}
            </div>

            {/* Daily Schedule */}
            <div className="space-y-6">
              {Object.entries(result.schedule).map(([dateString, attractions]) => (
                <div key={dateString} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {formatDate(dateString)} ({attractions.length} attractions)
                  </h3>

                  {attractions.length === 0 ? (
                    <p className="text-gray-500 italic">No attractions scheduled for this day</p>
                  ) : (
                    <div className="space-y-3">
                      {attractions.map((scheduled: ScheduledAttraction, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{scheduled.attraction.name}</h4>
                            <div className="text-sm text-gray-600">
                              ⭐ {scheduled.attraction.rating} ({scheduled.attraction.ratingCount} reviews)
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Time:</span> {formatTime(scheduled.startTime)} - {formatTime(scheduled.endTime)}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {scheduled.attraction.visitDurationMinutes} minutes
                            </div>
                            <div>
                              <span className="font-medium">Travel from previous:</span> {scheduled.travelFromPrevMinutes} minutes
                            </div>
                          </div>

                          <div className="text-sm text-gray-500 mt-2">
                            📍 Lat: {scheduled.attraction.latitude}, Lng: {scheduled.attraction.longitude}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}