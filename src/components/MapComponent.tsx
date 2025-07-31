import React, { useEffect, useState, useCallback } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { RouteData, TravelMode, LocationData } from '../types';
import { RouteService } from '../services/routeService';

interface MapComponentProps {
  startLocation: LocationData | null;
  endLocation: LocationData | null;
  travelMode: TravelMode;
  onRouteData: (data: RouteData | null) => void;
  onLocationSelect: (location: LocationData, type: 'start' | 'end') => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  startLocation,
  endLocation,
  travelMode,
  onRouteData,
  onLocationSelect,
}) => {
  const { mapRef, map, isLoaded, error } = useGoogleMaps();
  const [routeService, setRouteService] = useState<RouteService | null>(null);
  const [currentPolyline, setCurrentPolyline] = useState<google.maps.Polyline | null>(null);
  const [startMarker, setStartMarker] = useState<google.maps.Marker | null>(null);
  const [endMarker, setEndMarker] = useState<google.maps.Marker | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>('roadmap');

  // Initialize RouteService after Google Maps API is loaded
  useEffect(() => {
    if (isLoaded && !routeService) {
      setRouteService(new RouteService());
    }
  }, [isLoaded, routeService]);

  // Update map style
  useEffect(() => {
    if (!map) return;
    
    const getMapTypeId = (style: string) => {
      switch (style) {
        case 'satellite': return google.maps.MapTypeId.SATELLITE;
        case 'hybrid': return google.maps.MapTypeId.HYBRID;
        case 'terrain': return google.maps.MapTypeId.TERRAIN;
        case 'accessibility':
        case 'hiking':
          return google.maps.MapTypeId.TERRAIN; // Use terrain as base for these
        default: return google.maps.MapTypeId.ROADMAP;
      }
    };

    map.setMapTypeId(getMapTypeId(mapStyle));

    // Apply custom styling for accessibility and hiking modes
    if (mapStyle === 'accessibility') {
      map.setOptions({
        styles: [
          {
            featureType: 'all',
            elementType: 'all',
            stylers: [
              { saturation: -100 },
              { lightness: 50 },
              { contrast: 100 }
            ]
          }
        ]
      });
    } else if (mapStyle === 'hiking') {
      map.setOptions({
        styles: [
          {
            featureType: 'poi.park',
            elementType: 'all',
            stylers: [{ visibility: 'on' }, { color: '#4CAF50' }]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'all',
            stylers: [{ visibility: 'on' }, { color: '#8BC34A' }]
          }
        ]
      });
    } else {
      map.setOptions({ styles: [] }); // Reset to default styles
    }
  }, [map, mapStyle]);

  // Handle map clicks for location selection
  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Use reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const location: LocationData = {
            address: results[0].formatted_address,
            lat,
            lng,
          };

          // Determine whether to set as start or end based on current state
          if (!startLocation) {
            onLocationSelect(location, 'start');
          } else if (!endLocation) {
            onLocationSelect(location, 'end');
          } else {
            // If both exist, replace the start location
            onLocationSelect(location, 'start');
          }
        }
      });
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, startLocation, endLocation, onLocationSelect]);

  // Update markers when locations change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    if (startMarker) {
      startMarker.setMap(null);
    }
    if (endMarker) {
      endMarker.setMap(null);
    }

    // Add start marker
    if (startLocation) {
      const marker = new google.maps.Marker({
        position: { lat: startLocation.lat, lng: startLocation.lng },
        map: map,
        title: 'Start Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#065F46',
          strokeWeight: 2,
          scale: 8,
        },
      });
      setStartMarker(marker);
    }

    // Add end marker
    if (endLocation) {
      const marker = new google.maps.Marker({
        position: { lat: endLocation.lat, lng: endLocation.lng },
        map: map,
        title: 'End Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#991B1B',
          strokeWeight: 2,
          scale: 8,
        },
      });
      setEndMarker(marker);
    }
  }, [map, startLocation, endLocation, startMarker, endMarker]);

  // Calculate route when locations and travel mode change
  const calculateRoute = useCallback(async () => {
    if (!map || !startLocation || !endLocation || !routeService) {
      onRouteData(null);
      return;
    }

    // Initialize places service for route service
    routeService.setMap(map);

    setIsCalculating(true);

    try {
      const routeData = await routeService.calculateRoute(
        startLocation,
        endLocation,
        travelMode,
        [] // No waypoints for now, can be extended later
      );

      // Clear existing polyline
      if (currentPolyline) {
        currentPolyline.setMap(null);
      }

      // Create new polyline
      const polyline = new google.maps.Polyline({
        path: routeData.points.map(point => ({ lat: point.lat, lng: point.lng })),
        geodesic: true,
        strokeColor: '#2563EB',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      polyline.setMap(map);
      setCurrentPolyline(polyline);

      // Fit map to route bounds
      const bounds = new google.maps.LatLngBounds();
      routeData.points.forEach(point => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });
      map.fitBounds(bounds);

      routeData.polyline = polyline;
      onRouteData(routeData);
    } catch (error) {
      console.error('Route calculation failed:', error);
      onRouteData(null);
    } finally {
      setIsCalculating(false);
    }
  }, [map, startLocation, endLocation, travelMode, routeService, currentPolyline, onRouteData]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure you have a valid Google Maps API key configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}

      {isCalculating && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-gray-700">Calculating route...</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-600">Click on map to set start/end points</p>
      </div>
    </div>
  );
};