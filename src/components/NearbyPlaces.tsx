import React, { useState, useEffect } from 'react';
import { MapPin, Star, Coffee, Utensils, Car, Fuel } from 'lucide-react';
import { RouteData } from '../types';
import { RouteService } from '../services/routeService';

interface NearbyPlacesProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

const PLACE_TYPES = [
  { type: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'text-orange-600' },
  { type: 'gas_station', label: 'Gas Stations', icon: Fuel, color: 'text-blue-600' },
  { type: 'cafe', label: 'Cafes', icon: Coffee, color: 'text-amber-600' },
  { type: 'parking', label: 'Parking', icon: Car, color: 'text-gray-600' },
];

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  routeData,
  routeService,
}) => {
  const [selectedType, setSelectedType] = useState('restaurant');
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setPlaces([]);
      return;
    }

    const searchNearbyPlaces = async () => {
      setLoading(true);
      try {
        // Search near the midpoint of the route
        const midIndex = Math.floor(routeData.points.length / 2);
        const midPoint = routeData.points[midIndex];
        const location = new google.maps.LatLng(midPoint.lat, midPoint.lng);
        
        const results = await routeService.findNearbyPlaces(location, selectedType, 2000);
        setPlaces(results.slice(0, 6)); // Limit to 6 results
      } catch (error) {
        console.error('Error finding nearby places:', error);
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    searchNearbyPlaces();
  }, [routeData, routeService, selectedType]);

  if (!routeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Places</h3>
        <p className="text-gray-500 text-sm">Plan a route to see nearby places of interest</p>
      </div>
    );
  }

  const selectedTypeData = PLACE_TYPES.find(t => t.type === selectedType);
  const Icon = selectedTypeData?.icon || MapPin;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Places</h3>
        
        {/* Place Type Selector */}
        <div className="flex flex-wrap gap-2">
          {PLACE_TYPES.map((placeType) => {
            const PlaceIcon = placeType.icon;
            return (
              <button
                key={placeType.type}
                onClick={() => setSelectedType(placeType.type)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === placeType.type
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PlaceIcon className="h-4 w-4" />
                <span>{placeType.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="space-y-3">
            {places.map((place, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${selectedTypeData?.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{place.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {place.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {place.vicinity && (
                      <span className="truncate">{place.vicinity}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon className={`h-12 w-12 mx-auto mb-3 ${selectedTypeData?.color} opacity-50`} />
            <p className="text-gray-500">No {selectedTypeData?.label.toLowerCase()} found near your route</p>
          </div>
        )}
      </div>
    </div>
  );
};