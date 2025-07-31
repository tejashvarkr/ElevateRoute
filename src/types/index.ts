export interface RoutePoint {
  lat: number;
  lng: number;
  elevation: number;
  distance: number;
}

export interface RouteStats {
  totalDistance: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  maxElevation: number;
  minElevation: number;
  maxGrade: number;
  minGrade: number;
  averageGrade: number;
  estimatedTime: number;
}

export interface RouteData {
  points: RoutePoint[];
  stats: RouteStats;
  polyline: google.maps.Polyline | null;
  waypoints?: LocationData[];
}

export type TravelMode = 'WALKING' | 'BICYCLING' | 'DRIVING';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface NearbyPlace {
  name: string;
  type: string;
  rating?: number;
  lat: number;
  lng: number;
  distance: number;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export interface SafetyAlert {
  type: 'construction' | 'traffic' | 'weather' | 'terrain';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface RouteAlternative {
  id: string;
  name: string;
  distance: number;
  duration: number;
  elevationGain: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  points: RoutePoint[];
}

export interface PhotoSpot {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  photos: string[];
  description: string;
}

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean;
  audioDescriptions: boolean;
  visualIndicators: boolean;
  tactileFeedback: boolean;
  voiceNavigation: boolean;
  highContrast: boolean;
  largeFonts: boolean;
}

export interface HikingFeatures {
  trailDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  terrainType: string[];
  waterSources: LocationData[];
  restAreas: LocationData[];
  emergencyExits: LocationData[];
  wildlifeAlerts: string[];
  seasonalConditions: string[];
}

export interface TravelComfort {
  restStops: LocationData[];
  fuelStations: LocationData[];
  restaurants: LocationData[];
  hotels: LocationData[];
  medicalFacilities: LocationData[];
  accessibleFacilities: LocationData[];
}

export interface VoiceGuidance {
  enabled: boolean;
  language: string;
  speed: number;
  volume: number;
}

export interface MapTileOptions {
  style: 'roadmap' | 'satellite' | 'hybrid' | 'terrain' | 'hiking' | 'accessibility';
  customTiles?: string;
}

export interface EmergencyInfo {
  nearestHospital: LocationData | null;
  emergencyContacts: string[];
  evacuationRoutes: LocationData[];
}