import React, { useState, useEffect } from 'react';
import { Route, Clock, TrendingUp, Zap, Award } from 'lucide-react';
import { RouteData, LocationData, TravelMode } from '../types';
import { RouteService } from '../services/routeService';

interface RouteAlternativesProps {
  startLocation: LocationData | null;
  endLocation: LocationData | null;
  travelMode: TravelMode;
  routeService: RouteService | null;
  onRouteSelect: (route: RouteData) => void;
  currentRoute: RouteData | null;
}

export const RouteAlternatives: React.FC<RouteAlternativesProps> = ({
  startLocation,
  endLocation,
  travelMode,
  routeService,
  onRouteSelect,
  currentRoute,
}) => {
  const [alternatives, setAlternatives] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startLocation || !endLocation || !routeService) {
      setAlternatives([]);
      return;
    }

    const fetchAlternatives = async () => {
      setLoading(true);
      try {
        const routes = await routeService.getRouteAlternatives(startLocation, endLocation, travelMode);
        setAlternatives(routes);
      } catch (error) {
        console.error('Failed to fetch route alternatives:', error);
        setAlternatives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [startLocation, endLocation, travelMode, routeService]);

  if (!startLocation || !endLocation) {
    return null;
  }

  const formatDistance = (distance: number) => {
    return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'extreme': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Zap className="h-4 w-4" />;
      case 'moderate': return <Route className="h-4 w-4" />;
      case 'hard': return <TrendingUp className="h-4 w-4" />;
      case 'extreme': return <Award className="h-4 w-4" />;
      default: return <Route className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Route Options</h3>
        <p className="text-sm text-gray-600">Compare different routes to your destination</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : alternatives.length > 0 ? (
          <div className="space-y-4">
            {alternatives.map((route, index) => {
              const difficulty = routeService?.calculateDifficulty(route.stats) || 'easy';
              const isSelected = currentRoute === route;
              
              return (
                <div
                  key={index}
                  onClick={() => onRouteSelect(route)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-800">
                        Route {index + 1}
                        {index === 0 && <span className="text-blue-600 text-sm ml-2">(Recommended)</span>}
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getDifficultyColor(difficulty)}`}>
                        {getDifficultyIcon(difficulty)}
                        <span className="capitalize">{difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Route className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Distance</p>
                        <p className="font-medium">{formatDistance(route.stats.totalDistance)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Est. Time</p>
                        <p className="font-medium">{formatTime(route.stats.estimatedTime)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Elevation</p>
                        <p className="font-medium">+{Math.round(route.stats.totalElevationGain)}m</p>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">✓ Currently selected route</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Route className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No alternative routes available</p>
          </div>
        )}
      </div>
    </div>
  );
};