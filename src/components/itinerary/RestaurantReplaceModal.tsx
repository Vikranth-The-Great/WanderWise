'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Clock, Navigation } from 'lucide-react';
import { Restaurant, getRestaurantsForMealSlot } from '@/services/restaurant-service';
import { Coordinates } from '@/lib/api/geoapify';

interface RestaurantReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  currentCoordinates: Coordinates;
  nextCoordinates?: Coordinates;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  currentRestaurantName?: string;
}

/**
 * Modal for replacing a meal location.
 * Allows searching nearby or along-route restaurants to swap into the itinerary.
 */
const RestaurantReplaceModal: React.FC<RestaurantReplaceModalProps> = ({
  isOpen,
  onClose,
  onSelectRestaurant,
  currentCoordinates,
  nextCoordinates,
  mealType,
  currentRestaurantName
}) => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [routeRestaurants, setRouteRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'nearby' | 'route'>('nearby');

  useEffect(() => {
    if (isOpen) {
      fetchRestaurants();
    }
  }, [isOpen, currentCoordinates, nextCoordinates]);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const { nearby, route } = await getRestaurantsForMealSlot(
        currentCoordinates,
        nextCoordinates,
        {
          radius: 1500,
          maxResults: 10,
          categories: mealType === 'breakfast' ? ['catering.restaurant', 'catering.fast_food'] : ['catering.restaurant', 'catering.fast_food']
        }
      );

      setNearbyRestaurants(nearby);
      setRouteRestaurants(route);

      // Set default tab based on available results
      if (nearby.length === 0 && route.length > 0) {
        setSelectedTab('route');
      }
    } catch (err) {
      setError('Failed to fetch restaurants. Please try again.');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    onSelectRestaurant(restaurant);
    onClose();
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const renderRestaurantCard = (restaurant: Restaurant) => (
    <div
      key={restaurant.id}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleSelectRestaurant(restaurant)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {restaurant.address}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {restaurant.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
            )}

            {restaurant.distance && (
              <div className="flex items-center">
                <Navigation className="w-4 h-4 mr-1" />
                <span>{formatDistance(restaurant.distance)}</span>
              </div>
            )}

            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span className="capitalize">{restaurant.category}</span>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${restaurant.type === 'nearby'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
            }`}>
            {restaurant.type === 'nearby' ? 'Nearby' : 'On Route'}
          </span>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Replace {currentRestaurantName || 'Restaurant'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a new restaurant for {mealType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${selectedTab === 'nearby'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setSelectedTab('nearby')}
          >
            Nearby Restaurants ({nearbyRestaurants.length})
          </button>
          {nextCoordinates && (
            <button
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${selectedTab === 'route'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setSelectedTab('route')}
            >
              On Route ({routeRestaurants.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Finding restaurants...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchRestaurants}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTab === 'nearby' ? (
                nearbyRestaurants.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Restaurants within 1.5km of your current location
                    </p>
                    {nearbyRestaurants.map(renderRestaurantCard)}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No nearby restaurants found</p>
                  </div>
                )
              ) : (
                routeRestaurants.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Restaurants along the route to your next destination
                    </p>
                    {routeRestaurants.map(renderRestaurantCard)}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Navigation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No restaurants found along the route</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantReplaceModal;