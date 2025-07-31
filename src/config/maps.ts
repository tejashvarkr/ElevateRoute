export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API key
  apiKey: 'AIzaSyD30biC2-Pgn3AoapTNnYMD7wEX1IIYUVM',
  libraries: ['places', 'geometry'] as const,
  defaultCenter: { lat: 37.7749, lng: -122.4194 }, // San Francisco
  defaultZoom: 12,
};

export const ELEVATION_SAMPLE_POINTS = 100; // Maximum points for elevation sampling
export const CHART_COLORS = {
  primary: '#2563EB',
  gradient: {
    start: '#3B82F6',
    end: '#1E40AF',
  },
  grid: '#E5E7EB',
  text: '#374151',
};