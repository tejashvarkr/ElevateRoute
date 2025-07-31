import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Fuel, 
  Utensils, 
  Bed, 
  Heart, 
  MapPin,
  Clock,
  Star,
  Navigation,
  Coffee
} from 'lucide-react';
import { RouteData, TravelComfort } from '../types';
import { RouteService } from '../services/routeService';

interface TravelComfortPanelProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

export const TravelComfortPanel: React.FC<TravelComfortPanelProps> = ({
  routeData,
  routeService,
}) => {
  const [comfortInfo, setComfortInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('restaurants');

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setComfortInfo(null);
      return;
    }

    const fetchComfortInfo = async () => {
      setLoading(true);
      try {
        const info = await routeService.getTravelComfortInfo(routeData.points);
        setComfortInfo(info);
      } catch (error) {
        console.error('Error fetching travel comfort info:', error);
        setComfortInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComfortInfo();
  }, [routeData, routeService]);

  if (!routeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Car className="h-5 w-5 mr-2 text-blue-600" />
          Travel Comfort
        </h3>
        <p className="text-gray-500 text-sm">Plan a route to see travel amenities</p>
      </div>
    );
  }

  const categories = [
    {
      key: 'restaurants',
      label: 'Restaurants',
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      key: 'fuelStations',
      label: 'Fuel Stations',
      icon: Fuel,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'hotels',
      label: 'Hotels',
      icon: Bed,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      key: 'restStops',
      label: 'Rest Areas',
      icon: Coffee,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      key: 'medicalFacilities',
      label: 'Medical',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);
  const selectedIcon = selectedCategoryData?.icon || MapPin;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Car className="h-5 w-5 mr-2 text-blue-600" />
          Travel Comfort & Amenities
        </h3>
        <p className="text-sm text-gray-600">Essential stops and services along your route</p>
      </div>

      <div className="p-6">
        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.key
                    ? `${category.bgColor} ${category.color} border border-current`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : comfortInfo && comfortInfo[selectedCategory] && comfortInfo[selectedCategory].length > 0 ? (
          <div className="space-y-3">
            {comfortInfo[selectedCategory].map((place: any, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${selectedCategoryData?.bgColor} flex items-center justify-center`}>
                  <selectedIcon className={`h-6 w-6 ${selectedCategoryData?.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{place.name}</h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    {place.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {place.vicinity && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{place.vicinity}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional info based on category */}
                  {selectedCategory === 'hotels' && place.price_level && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-gray-500">Price: </span>
                      <span className="text-xs text-gray-600">
                        {'$'.repeat(place.price_level)}
                      </span>
                    </div>
                  )}
                  
                  {selectedCategory === 'restaurants' && place.types && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {place.types.includes('meal_takeaway') ? 'Takeaway' : 'Dine-in'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-1">
                  {place.opening_hours && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      place.opening_hours.open_now 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {place.opening_hours.open_now ? 'Open' : 'Closed'}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
                      window.open(url, '_blank');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <selectedIcon className={`h-12 w-12 mx-auto mb-3 ${selectedCategoryData?.color} opacity-50`} />
            <p className="text-gray-500">No {selectedCategoryData?.label.toLowerCase()} found near your route</p>
            <p className="text-gray-400 text-sm mt-1">Try a different route or category</p>
          </div>
        )}

        {/* Travel Tips */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            Travel Tips
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Plan fuel stops every 300-400km for long trips</li>
            <li>• Book accommodations in advance during peak seasons</li>
            <li>• Keep emergency contact numbers handy</li>
            <li>• Check opening hours before visiting establishments</li>
            <li>• Consider rest stops every 2 hours for safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
};