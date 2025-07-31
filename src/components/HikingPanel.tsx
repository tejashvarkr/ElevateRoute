import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Droplets, 
  MapPin, 
  AlertTriangle, 
  Thermometer,
  Wind,
  Sun,
  Cloud,
  TreePine,
  Compass
} from 'lucide-react';
import { RouteData, HikingFeatures } from '../types';
import { RouteService } from '../services/routeService';

interface HikingPanelProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

export const HikingPanel: React.FC<HikingPanelProps> = ({
  routeData,
  routeService,
}) => {
  const [hikingInfo, setHikingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setHikingInfo(null);
      return;
    }

    const fetchHikingInfo = async () => {
      setLoading(true);
      try {
        const info = await routeService.getHikingTrailInfo(routeData.points);
        setHikingInfo(info);
        
        // Simulate weather data (in real app, use Weather API)
        setWeatherInfo({
          temperature: 22,
          condition: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          uvIndex: 6,
          visibility: 'Good',
        });
      } catch (error) {
        console.error('Error fetching hiking info:', error);
        setHikingInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHikingInfo();
  }, [routeData, routeService]);

  if (!routeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Mountain className="h-5 w-5 mr-2 text-green-600" />
          Hiking Information
        </h3>
        <p className="text-gray-500 text-sm">Plan a route to see hiking details</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <TreePine className="h-4 w-4" />;
      case 'intermediate': return <Mountain className="h-4 w-4" />;
      case 'advanced': return <Compass className="h-4 w-4" />;
      case 'expert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Mountain className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Mountain className="h-5 w-5 mr-2 text-green-600" />
          Hiking Information
        </h3>
        <p className="text-sm text-gray-600">Trail conditions and hiking essentials</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trail Difficulty */}
            {hikingInfo && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Trail Difficulty</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getDifficultyColor(hikingInfo.difficulty)}`}>
                    {getDifficultyIcon(hikingInfo.difficulty)}
                    <span className="capitalize">{hikingInfo.difficulty}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Terrain:</strong> {hikingInfo.terrainAnalysis.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Weather Conditions */}
            {weatherInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Current Weather
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span>{weatherInfo.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <span>{weatherInfo.condition}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span>{weatherInfo.humidity}% Humidity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <span>{weatherInfo.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hiking Essentials Checklist */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                Hiking Essentials
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  'Water (2-3 liters)',
                  'First aid kit',
                  'Map and compass',
                  'Emergency whistle',
                  'Weather protection',
                  'Extra food/snacks',
                  'Headlamp/flashlight',
                  'Emergency shelter',
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trail Features */}
            {hikingInfo && hikingInfo.trailheads && hikingInfo.trailheads.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Nearby Trailheads
                </h4>
                <div className="space-y-2">
                  {hikingInfo.trailheads.map((trailhead: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{trailhead.name}</p>
                        {trailhead.vicinity && (
                          <p className="text-sm text-gray-600">{trailhead.vicinity}</p>
                        )}
                      </div>
                      {trailhead.rating && (
                        <div className="text-sm text-gray-600">
                          ⭐ {trailhead.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Water Sources */}
            {hikingInfo && hikingInfo.waterSources && hikingInfo.waterSources.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                  Water Sources
                </h4>
                <div className="space-y-2">
                  {hikingInfo.waterSources.slice(0, 3).map((source: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">{source.name}</p>
                        {source.vicinity && (
                          <p className="text-sm text-gray-600">{source.vicinity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                Safety Tips
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Inform someone of your hiking plan and expected return</li>
                <li>• Check weather conditions before departure</li>
                <li>• Stay on marked trails</li>
                <li>• Carry emergency communication device</li>
                <li>• Know your limits and turn back if conditions worsen</li>
                <li>• Be aware of wildlife in the area</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};