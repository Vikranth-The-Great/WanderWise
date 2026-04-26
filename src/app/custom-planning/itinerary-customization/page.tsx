'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Plus, Eye, MapPin, Clock, Star, Edit, ExternalLink, Map, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ItineraryCustomization() {
  const [searchDropdown, setSearchDropdown] = useState<number | null>(null);
  const [editingTiming, setEditingTiming] = useState<number | string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  interface Activity {
    id: string | number;
    type: string;
    name: string;
    time: string;
    location?: string;
    category?: string;
    icon?: string;
  }
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [activityIdCounter, setActivityIdCounter] = useState(0);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setSearchDropdown(null);
    };

    if (searchDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [searchDropdown]);

  // Sample attraction data
  const attractions = [
    {
      id: 1,
      name: "Mysore Palace",
      image: "/images/mysore-palace.jpg",
      timing: "10:00 - 17:30",
      type: "Historical",
      rating: 4.5
    },
    {
      id: 2,
      name: "Chamundi Hills",
      image: "/images/chamundi-hills.jpg",
      timing: "06:00 - 20:00",
      type: "Nature",
      rating: 4.3
    },
    {
      id: 3,
      name: "Mysore Zoo",
      image: "/images/mysore-zoo.jpg",
      timing: "08:30 - 17:30",
      type: "Wildlife",
      rating: 4.2
    },
    {
      id: 4,
      name: "Brindavan Gardens",
      image: "/images/brindavan-gardens.jpg",
      timing: "18:00 - 20:00",
      type: "Garden",
      rating: 4.4
    },
    {
      id: 5,
      name: "St. Philomena's Cathedral",
      image: "/images/cathedral.jpg",
      timing: "06:00 - 20:00",
      type: "Religious",
      rating: 4.1
    },
    {
      id: 6,
      name: "Karanji Lake",
      image: "/images/karanji-lake.jpg",
      timing: "08:30 - 17:30",
      type: "Nature",
      rating: 4.0
    }
  ];

  // Sample itinerary data
  const itineraryItems = [
    {
      id: 1,
      type: "attraction",
      name: "Mysore Palace",
      time: "7:00 - 8:00",
      category: "Historical"
    },
    {
      id: 2,
      type: "meal",
      name: "Breakfast",
      time: "8:00 - 9:00",
      category: "meal"
    },
    {
      id: 3,
      type: "attraction",
      name: "Chamundi Hills",
      time: "10:00 - 11:30",
      category: "Nature"
    },
    {
      id: 4,
      type: "attraction",
      name: "Mysore Zoo",
      time: "12:00 - 1:30",
      category: "Wildlife"
    },
    {
      id: 5,
      type: "meal",
      name: "Lunch",
      time: "13:30 - 2:30",
      category: "meal"
    },
    {
      id: 6,
      type: "attraction",
      name: "Brindavan Gardens",
      time: "15:00 - 17:00",
      category: "Garden"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  const handleSearchNavigation = (platform: string, attractionName: string) => {
    const query = encodeURIComponent(attractionName);
    let url = '';

    switch (platform) {
      case 'google':
        url = `https://www.google.com/search?q=${query}`;
        break;
      case 'youtube':
        url = `https://www.youtube.com/results?search_query=${query}`;
        break;
      case 'instagram':
        url = `https://www.instagram.com/explore/tags/${query.replace(/\s+/g, '')}/`;
        break;
    }

    window.open(url, '_blank');
    setSearchDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border border-gray-300 rounded-sm" style={{ borderWidth: '0.5px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
            </div>

            {/* Trip Title */}
            <div className="text-lg font-semibold text-gray-800">
              My Trip – Day 1
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-8">
              {/* Undo/Redo Group */}
              <div className="flex items-center space-x-3">
                {/* Undo Button */}
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="Undo">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>

                {/* Redo Button */}
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="Redo">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                  </svg>
                </button>
              </div>

              {/* AI Button */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center" title="AI Assistant">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI
              </button>

              {/* Map Button */}
              <button
                onClick={() => setShowMap(true)}
                className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:bg-gray-50 flex items-center"
                title="View Map"
              >
                <Map className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700 font-medium">Map</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Attractions List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Attractions</h2>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search attractions..."
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded" title="Sort">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </button>
                  <Filter className="w-5 h-5 cursor-pointer hover:text-gray-600 text-gray-400" />
                </div>
              </div>

              {/* Attraction Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[42rem] overflow-y-auto pr-2" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                {attractions.map((attraction) => (
                  <div key={attraction.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {/* Placeholder Image */}
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                      <div className="absolute top-2 left-2">
                        <span className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-700">
                          {attraction.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{attraction.name}</h3>

                        {/* Search Icon with Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchDropdown(searchDropdown === attraction.id ? null : attraction.id);
                            }}
                            className="flex items-center text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50"
                          >
                            <Search className="w-4 h-4" />
                          </button>

                          {searchDropdown === attraction.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                            >
                              <button
                                onClick={() => handleSearchNavigation('google', attraction.name)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              >
                                <ExternalLink className="w-3 h-3 mr-2" />
                                Google
                              </button>
                              <button
                                onClick={() => handleSearchNavigation('youtube', attraction.name)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                              >
                                <ExternalLink className="w-3 h-3 mr-2" />
                                YouTube
                              </button>
                              <button
                                onClick={() => handleSearchNavigation('instagram', attraction.name)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center rounded-b-lg"
                              >
                                <ExternalLink className="w-3 h-3 mr-2" />
                                Instagram
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        {attraction.timing}
                      </div>

                      {renderStars(attraction.rating)}

                      <div className="flex justify-between items-center mt-4">
                        <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>

                        <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Itinerary Scheduler */}
          <div className="space-y-6">
            {/* Day Navigation */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="bg-yellow-300 px-6 py-2 rounded-full">
                  <span className="font-semibold text-gray-900">Day 1</span>
                </div>

                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Timeline Scheduler */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Daily Schedule</h2>
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Add Activity"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[...itineraryItems, ...customActivities].map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-l-4 ${item.type === 'meal'
                          ? 'bg-orange-50 border-orange-400'
                          : item.type === 'custom'
                            ? 'bg-green-50 border-green-400'
                            : 'bg-purple-50 border-purple-400'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`px-2 py-1 rounded text-xs font-medium mr-3 ${item.type === 'meal'
                              ? 'bg-orange-200 text-orange-800'
                              : item.type === 'custom'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-purple-200 text-purple-800'
                            }`}>
                            {item.type === 'custom' ? item.name : (item as Activity).category}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.type === 'custom' ? (
                                <span className="flex items-center">
                                  <span className="mr-2">{(item as Activity).icon}</span>
                                  {item.name}
                                </span>
                              ) : (
                                item.name
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">{item.time}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.type === 'attraction' && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="w-5 h-5" />
                            </button>
                          )}

                          {/* Edit Icon for both attraction and meal cards */}
                          <button
                            onClick={() => setEditingTiming(editingTiming === item.id ? null : item.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                            title="Edit timing"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Minus button for attractions and custom activities */}
                          {(item.type === 'attraction' || item.type === 'custom') && (
                            <button
                              onClick={() => {
                                if (item.type === 'custom') {
                                  setCustomActivities(prev => prev.filter(activity => activity.id !== item.id));
                                  toast.success('Activity removed from schedule!');
                                }
                              }}
                              className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50"
                              title="Remove from day"
                            >
                              <Minus className="w-6 h-6" />
                            </button>
                          )}

                          {/* Drag & Drop Handle */}
                          <button
                            className="text-gray-400 hover:text-gray-600 p-2 cursor-grab active:cursor-grabbing"
                            title="Drag to reorder"
                          >
                            <span className="text-lg leading-none">☰</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Panel with Update Button */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Total Time: 8 hrs</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-1">💰</span>
                <span>Est. Cost: $50</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Distance: 20 km</span>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update
            </button>
          </div>
        </div>

        {/* Floating Map Button */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => setShowMap(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="Quick Map View"
          >
            <Map className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Finalize Button Panel */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-center">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
              Finalize Itinerary
            </button>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-96 relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Map View</h3>
              <button
                onClick={() => setShowMap(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 h-full">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Map className="w-12 h-12 mx-auto mb-2" />
                  <p>Interactive map will be displayed here</p>
                  <p className="text-sm">Integration with mapping service required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Activity</h3>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Choose an activity type to add to your schedule:</p>
              <div className="space-y-3">
                {[
                  { type: 'Shopping', icon: '🛍️', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
                  { type: 'Hotel', icon: '🏨', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
                  { type: 'Snacks', icon: '🍿', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' }
                ].map((activity) => (
                  <button
                    key={activity.type}
                    onClick={() => {
                      const newActivity = {
                        id: `custom-${activityIdCounter}`,
                        type: 'custom',
                        name: activity.type,
                        time: '12:00',
                        duration: '1 hour',
                        icon: activity.icon
                      };
                      setCustomActivities(prev => [...prev, newActivity]);
                      setActivityIdCounter(prev => prev + 1);
                      setShowAddActivityModal(false);
                      toast.success(`${activity.type} activity added to your schedule!`);
                    }}
                    className={`w-full p-4 border-2 rounded-lg transition-colors text-left flex items-center ${activity.color}`}
                  >
                    <span className="text-2xl mr-3">{activity.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{activity.type}</div>
                      <div className="text-sm text-gray-600">Add {activity.type.toLowerCase()} to your itinerary</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
