import React, { useState, useEffect } from 'react';
import { Camera, Star, MapPin, ExternalLink } from 'lucide-react';
import { RouteData } from '../types';
import { RouteService } from '../services/routeService';

interface PhotoSpotsProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

export const PhotoSpots: React.FC<PhotoSpotsProps> = ({
  routeData,
  routeService,
}) => {
  const [photoSpots, setPhotoSpots] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setPhotoSpots([]);
      return;
    }

    const fetchPhotoSpots = async () => {
      setLoading(true);
      try {
        const spots = await routeService.getPhotoSpots(routeData.points);
        setPhotoSpots(spots);
      } catch (error) {
        console.error('Error fetching photo spots:', error);
        setPhotoSpots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoSpots();
  }, [routeData, routeService]);

  if (!routeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-purple-600" />
          Photo Opportunities
        </h3>
        <p className="text-gray-500 text-sm">Plan a route to discover scenic photo spots</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-purple-600" />
          Photo Opportunities
        </h3>
        <p className="text-sm text-gray-600">Scenic spots and attractions along your route</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : photoSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photoSpots.map((spot, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {spot.photos && spot.photos[0] && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={spot.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                      <Camera className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm leading-tight">
                      {spot.name}
                    </h4>
                    {spot.rating && (
                      <div className="flex items-center space-x-1 text-xs">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{spot.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {spot.vicinity && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{spot.vicinity}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600 font-medium">
                      Tourist Attraction
                    </span>
                    {spot.place_id && (
                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/place/?q=place_id:${spot.place_id}`;
                          window.open(url, '_blank');
                        }}
                        className="text-xs text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No photo opportunities found along this route</p>
            <p className="text-gray-400 text-sm mt-1">Try a route through more scenic areas</p>
          </div>
        )}
      </div>
    </div>
  );
};