import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG } from '../config/maps';

export const useGoogleMaps = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.apiKey,
          version: 'weekly',
          libraries: GOOGLE_MAPS_CONFIG.libraries,
        });

        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: GOOGLE_MAPS_CONFIG.defaultCenter,
            zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          setMap(mapInstance);
          setIsLoaded(true);
        }
      } catch (err) {
        setError('Failed to load Google Maps. Please check your API key.');
        console.error('Google Maps loading error:', err);
      }
    };

    initMap();
  }, []);

  return { mapRef, map, isLoaded, error };
};