import { RouteData, RoutePoint, RouteStats, TravelMode, LocationData } from '../types';
import { ELEVATION_SAMPLE_POINTS } from '../config/maps';

export class RouteService {
  private directionsService: google.maps.DirectionsService;
  private elevationService: google.maps.ElevationService;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    this.directionsService = new google.maps.DirectionsService();
    this.elevationService = new google.maps.ElevationService();
  }

  setMap(map: google.maps.Map) {
    this.placesService = new google.maps.places.PlacesService(map);
  }

  async calculateRoute(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode,
    waypoints?: LocationData[]
  ): Promise<RouteData> {
    try {
      // Get directions
      const directionsResult = await this.getDirections(start, end, travelMode, waypoints);
      const route = directionsResult.routes[0];
      
      // Sample points along the route for elevation
      const pathPoints = this.sampleRoutePoints(route.overview_path, ELEVATION_SAMPLE_POINTS);
      
      // Get elevation data
      const elevationData = await this.getElevationData(pathPoints);
      
      // Calculate distances and create route points
      const routePoints = this.createRoutePoints(elevationData, route.overview_path);
      
      // Calculate statistics
      const stats = this.calculateRouteStats(routePoints);

      return {
        points: routePoints,
        stats,
        polyline: null, // Will be set by the map component
        waypoints,
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error('Failed to calculate route. Please try again.');
    }
  }

  private getDirections(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode,
    waypoints?: LocationData[]
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      const waypointObjects = waypoints?.map(wp => ({
        location: { lat: wp.lat, lng: wp.lng },
        stopover: true,
      })) || [];

      this.directionsService.route(
        {
          origin: { lat: start.lat, lng: start.lng },
          destination: { lat: end.lat, lng: end.lng },
          waypoints: waypointObjects,
          travelMode: google.maps.TravelMode[travelMode],
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  private sampleRoutePoints(
    path: google.maps.LatLng[],
    sampleCount: number
  ): google.maps.LatLng[] {
    if (path.length <= sampleCount) {
      return path;
    }

    const samples: google.maps.LatLng[] = [];
    const interval = (path.length - 1) / (sampleCount - 1);

    for (let i = 0; i < sampleCount; i++) {
      const index = Math.round(i * interval);
      samples.push(path[index]);
    }

    return samples;
  }

  private getElevationData(locations: google.maps.LatLng[]): Promise<google.maps.ElevationResult[]> {
    return new Promise((resolve, reject) => {
      this.elevationService.getElevationForLocations(
        { locations },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Elevation request failed: ${status}`));
          }
        }
      );
    });
  }

  private createRoutePoints(
    elevationData: google.maps.ElevationResult[],
    fullPath: google.maps.LatLng[]
  ): RoutePoint[] {
    const points: RoutePoint[] = [];
    let totalDistance = 0;

    elevationData.forEach((result, index) => {
      if (index > 0) {
        const prevPoint = elevationData[index - 1];
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          prevPoint.location,
          result.location
        );
        totalDistance += distance;
      }

      points.push({
        lat: result.location.lat(),
        lng: result.location.lng(),
        elevation: result.elevation,
        distance: totalDistance,
      });
    });

    return points;
  }

  private calculateRouteStats(points: RoutePoint[]): RouteStats {
    if (points.length === 0) {
      return {
        totalDistance: 0,
        totalElevationGain: 0,
        totalElevationLoss: 0,
        maxElevation: 0,
        minElevation: 0,
        maxGrade: 0,
        minGrade: 0,
        averageGrade: 0,
        estimatedTime: 0,
      };
    }

    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = points[0].elevation;
    let minElevation = points[0].elevation;
    let maxGrade = 0;
    let minGrade = 0;
    let totalGrade = 0;
    let gradeCount = 0;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      // Track elevation extremes
      maxElevation = Math.max(maxElevation, current.elevation);
      minElevation = Math.min(minElevation, current.elevation);

      // Calculate elevation changes
      const elevationChange = current.elevation - previous.elevation;
      if (elevationChange > 0) {
        elevationGain += elevationChange;
      } else {
        elevationLoss += Math.abs(elevationChange);
      }

      // Calculate grade
      const distanceChange = current.distance - previous.distance;
      if (distanceChange > 0) {
        const grade = (elevationChange / distanceChange) * 100;
        maxGrade = Math.max(maxGrade, grade);
        minGrade = Math.min(minGrade, grade);
        totalGrade += Math.abs(grade);
        gradeCount++;
      }
    }

    const totalDistance = points[points.length - 1].distance;
    const averageGrade = gradeCount > 0 ? totalGrade / gradeCount : 0;
    
    // Estimate time based on distance and elevation gain (Naismith's rule for hiking)
    const baseTime = totalDistance / 1000 * 15; // 15 minutes per km
    const elevationTime = elevationGain / 100 * 10; // 10 minutes per 100m elevation gain
    const estimatedTime = baseTime + elevationTime;

    return {
      totalDistance,
      totalElevationGain: elevationGain,
      totalElevationLoss: elevationLoss,
      maxElevation,
      minElevation,
      maxGrade,
      minGrade,
      averageGrade,
      estimatedTime,
    };
  }

  async findNearbyPlaces(
    location: google.maps.LatLng,
    type: string,
    radius: number = 1000
  ): Promise<google.maps.places.PlaceResult[]> {
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location,
        radius,
        type,
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  async getRouteAlternatives(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode
  ): Promise<RouteData[]> {
    try {
      const alternatives: RouteData[] = [];
      
      // Get multiple route options
      const directionsResult = await this.getDirectionsWithAlternatives(start, end, travelMode);
      
      for (let i = 0; i < Math.min(directionsResult.routes.length, 3); i++) {
        const route = directionsResult.routes[i];
        const pathPoints = this.sampleRoutePoints(route.overview_path, ELEVATION_SAMPLE_POINTS);
        const elevationData = await this.getElevationData(pathPoints);
        const routePoints = this.createRoutePoints(elevationData, route.overview_path);
        const stats = this.calculateRouteStats(routePoints);

        alternatives.push({
          points: routePoints,
          stats,
          polyline: null,
        });
      }
      
      return alternatives;
    } catch (error) {
      console.error('Alternative routes calculation error:', error);
      return [];
    }
  }

  private getDirectionsWithAlternatives(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin: { lat: start.lat, lng: start.lng },
          destination: { lat: end.lat, lng: end.lng },
          travelMode: google.maps.TravelMode[travelMode],
          provideRouteAlternatives: true,
          avoidHighways: false,
          avoidTolls: false,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  async getPhotoSpots(routePoints: RoutePoint[]): Promise<google.maps.places.PlaceResult[]> {
    if (!this.placesService || routePoints.length === 0) {
      return [];
    }

    const photoSpots: google.maps.places.PlaceResult[] = [];
    const samplePoints = routePoints.filter((_, index) => index % 10 === 0); // Sample every 10th point

    for (const point of samplePoints.slice(0, 5)) { // Limit to 5 searches
      try {
        const location = new google.maps.LatLng(point.lat, point.lng);
        const places = await this.findNearbyPlaces(location, 'tourist_attraction', 1500);
        
        // Filter for highly rated places with photos
        const goodSpots = places.filter(place => 
          place.rating && place.rating >= 4.0 && place.photos && place.photos.length > 0
        );
        
        photoSpots.push(...goodSpots.slice(0, 2)); // Max 2 per search point
      } catch (error) {
        console.error('Photo spots search error:', error);
      }
    }

    return photoSpots.slice(0, 8); // Return max 8 photo spots
  }

  calculateDifficulty(stats: RouteStats): 'easy' | 'moderate' | 'hard' | 'extreme' {
    const distance = stats.totalDistance / 1000; // Convert to km
    const elevationGain = stats.totalElevationGain;
    const maxGrade = Math.abs(stats.maxGrade);

    // Difficulty scoring algorithm
    let score = 0;
    
    // Distance factor
    if (distance > 20) score += 3;
    else if (distance > 10) score += 2;
    else if (distance > 5) score += 1;
    
    // Elevation gain factor
    if (elevationGain > 1000) score += 3;
    else if (elevationGain > 500) score += 2;
    else if (elevationGain > 200) score += 1;
    
    // Grade factor
    if (maxGrade > 20) score += 3;
    else if (maxGrade > 15) score += 2;
    else if (maxGrade > 10) score += 1;

    if (score >= 7) return 'extreme';
    if (score >= 5) return 'hard';
    if (score >= 3) return 'moderate';
    return 'easy';
  }

  async getTrafficInfo(routePoints: RoutePoint[]): Promise<string[]> {
    // Simulate traffic analysis (in real app, you'd use Traffic API)
    const alerts: string[] = [];
    
    if (routePoints.length > 50) {
      alerts.push('Heavy traffic expected during peak hours');
    }
    
    // Check for steep grades that might affect traffic
    const steepSections = routePoints.filter((point, index) => {
      if (index === 0) return false;
      const prevPoint = routePoints[index - 1];
      const elevationChange = point.elevation - prevPoint.elevation;
      const distance = point.distance - prevPoint.distance;
      const grade = Math.abs((elevationChange / distance) * 100);
      return grade > 15;
    });

    if (steepSections.length > 5) {
      alerts.push('Multiple steep sections - allow extra time');
    }

    return alerts;
  }

  async getAccessibleRoutes(
    start: LocationData,
    end: LocationData,
    accessibilityNeeds: string[]
  ): Promise<RouteData[]> {
    try {
      const accessibleRoutes: RouteData[] = [];
      
      // Request routes avoiding stairs, steep inclines for wheelchair users
      const directionsResult = await this.getDirectionsWithAccessibility(
        start, 
        end, 
        accessibilityNeeds
      );
      
      for (const route of directionsResult.routes) {
        const pathPoints = this.sampleRoutePoints(route.overview_path, ELEVATION_SAMPLE_POINTS);
        const elevationData = await this.getElevationData(pathPoints);
        const routePoints = this.createRoutePoints(elevationData, route.overview_path);
        const stats = this.calculateRouteStats(routePoints);

        accessibleRoutes.push({
          points: routePoints,
          stats,
          polyline: null,
        });
      }
      
      return accessibleRoutes;
    } catch (error) {
      console.error('Accessible routes calculation error:', error);
      return [];
    }
  }

  private getDirectionsWithAccessibility(
    start: LocationData,
    end: LocationData,
    accessibilityNeeds: string[]
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      const request: google.maps.DirectionsRequest = {
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: true,
        avoidHighways: accessibilityNeeds.includes('wheelchair'),
        avoidTolls: false,
      };

      this.directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          resolve(result);
        } else {
          reject(new Error(`Accessible directions request failed: ${status}`));
        }
      });
    });
  }

  async getHikingTrailInfo(routePoints: RoutePoint[]): Promise<any> {
    if (routePoints.length === 0) return null;

    const midPoint = routePoints[Math.floor(routePoints.length / 2)];
    const location = new google.maps.LatLng(midPoint.lat, midPoint.lng);

    try {
      // Find hiking-related places
      const trailheads = await this.findNearbyPlaces(location, 'park', 5000);
      const waterSources = await this.findNearbyPlaces(location, 'natural_feature', 2000);
      
      return {
        trailheads: trailheads.slice(0, 3),
        waterSources: waterSources.slice(0, 5),
        difficulty: this.calculateHikingDifficulty(routePoints),
        terrainAnalysis: this.analyzeHikingTerrain(routePoints),
      };
    } catch (error) {
      console.error('Hiking trail info error:', error);
      return null;
    }
  }

  private calculateHikingDifficulty(routePoints: RoutePoint[]): string {
    const stats = this.calculateRouteStats(routePoints);
    const distance = stats.totalDistance / 1000;
    const elevationGain = stats.totalElevationGain;
    const maxGrade = Math.abs(stats.maxGrade);

    if (distance > 15 || elevationGain > 800 || maxGrade > 25) return 'expert';
    if (distance > 10 || elevationGain > 500 || maxGrade > 20) return 'advanced';
    if (distance > 5 || elevationGain > 300 || maxGrade > 15) return 'intermediate';
    return 'beginner';
  }

  private analyzeHikingTerrain(routePoints: RoutePoint[]): string[] {
    const terrain: string[] = [];
    const stats = this.calculateRouteStats(routePoints);

    if (stats.maxElevation > 2000) terrain.push('High altitude');
    if (stats.maxGrade > 20) terrain.push('Steep climbs');
    if (stats.totalDistance > 10000) terrain.push('Long distance');
    if (stats.totalElevationGain > 500) terrain.push('Significant elevation gain');

    return terrain.length > 0 ? terrain : ['Moderate terrain'];
  }

  async getTravelComfortInfo(routePoints: RoutePoint[]): Promise<any> {
    if (routePoints.length === 0) return null;

    const midPoint = routePoints[Math.floor(routePoints.length / 2)];
    const location = new google.maps.LatLng(midPoint.lat, midPoint.lng);

    try {
      const [restStops, fuelStations, restaurants, hotels, medical] = await Promise.all([
        this.findNearbyPlaces(location, 'rest_stop', 10000),
        this.findNearbyPlaces(location, 'gas_station', 15000),
        this.findNearbyPlaces(location, 'restaurant', 5000),
        this.findNearbyPlaces(location, 'lodging', 20000),
        this.findNearbyPlaces(location, 'hospital', 25000),
      ]);

      return {
        restStops: restStops.slice(0, 3),
        fuelStations: fuelStations.slice(0, 5),
        restaurants: restaurants.slice(0, 8),
        hotels: hotels.slice(0, 4),
        medicalFacilities: medical.slice(0, 2),
      };
    } catch (error) {
      console.error('Travel comfort info error:', error);
      return null;
    }
  }

  async getEmergencyInfo(routePoints: RoutePoint[]): Promise<any> {
    if (routePoints.length === 0) return null;

    const midPoint = routePoints[Math.floor(routePoints.length / 2)];
    const location = new google.maps.LatLng(midPoint.lat, midPoint.lng);

    try {
      const hospitals = await this.findNearbyPlaces(location, 'hospital', 50000);
      const policeStations = await this.findNearbyPlaces(location, 'police', 25000);

      return {
        nearestHospital: hospitals[0] || null,
        policeStations: policeStations.slice(0, 2),
        emergencyContacts: ['911', 'Local Emergency Services'],
      };
    } catch (error) {
      console.error('Emergency info error:', error);
      return null;
    }
  }
}
