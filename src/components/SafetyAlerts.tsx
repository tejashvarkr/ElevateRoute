import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Info, Clock } from 'lucide-react';
import { RouteData } from '../types';
import { RouteService } from '../services/routeService';

interface SafetyAlertsProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

export const SafetyAlerts: React.FC<SafetyAlertsProps> = ({
  routeData,
  routeService,
}) => {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setAlerts([]);
      return;
    }

    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const trafficAlerts = await routeService.getTrafficInfo(routeData.points);
        
        // Add terrain-based alerts
        const terrainAlerts: string[] = [];
        
        if (routeData.stats.maxGrade > 20) {
          terrainAlerts.push('Extremely steep sections detected - use caution');
        } else if (routeData.stats.maxGrade > 15) {
          terrainAlerts.push('Very steep sections ahead - prepare for challenging terrain');
        }
        
        if (routeData.stats.totalElevationGain > 1000) {
          terrainAlerts.push('High elevation gain - ensure adequate fitness level');
        }
        
        if (routeData.stats.totalDistance > 20000) {
          terrainAlerts.push('Long distance route - plan for rest stops and supplies');
        }

        // Weather-based alerts (simulated)
        const weatherAlerts: string[] = [];
        if (routeData.stats.maxElevation > 1500) {
          weatherAlerts.push('High altitude route - weather conditions may change rapidly');
        }

        setAlerts([...trafficAlerts, ...terrainAlerts, ...weatherAlerts]);
      } catch (error) {
        console.error('Error fetching safety alerts:', error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [routeData, routeService]);

  if (!routeData) {
    return null;
  }

  const getSafetyScore = () => {
    let score = 100;
    
    if (routeData.stats.maxGrade > 20) score -= 20;
    else if (routeData.stats.maxGrade > 15) score -= 15;
    else if (routeData.stats.maxGrade > 10) score -= 10;
    
    if (routeData.stats.totalElevationGain > 1000) score -= 15;
    else if (routeData.stats.totalElevationGain > 500) score -= 10;
    
    if (routeData.stats.totalDistance > 20000) score -= 10;
    else if (routeData.stats.totalDistance > 10000) score -= 5;
    
    return Math.max(score, 0);
  };

  const safetyScore = getSafetyScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Shield className="h-4 w-4" />;
    if (score >= 60) return <Info className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Safety & Alerts
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getScoreColor(safetyScore)}`}>
            {getScoreIcon(safetyScore)}
            <span>Safety Score: {safetyScore}/100</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Safety Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Safety Recommendations
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Carry sufficient water and snacks</li>
                <li>• Check weather conditions before departure</li>
                <li>• Inform someone of your planned route</li>
                <li>• Carry a first aid kit and emergency supplies</li>
                {routeData.stats.maxElevation > 1000 && (
                  <li>• Consider altitude acclimatization</li>
                )}
              </ul>
            </div>

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Active Alerts
                </h4>
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-orange-800">{alert}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Best Times to Travel */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Optimal Travel Times
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Early morning (6-9 AM): Best visibility and cooler temperatures</p>
                <p>• Late afternoon (4-6 PM): Good lighting for photos</p>
                <p>• Avoid: Peak sun hours (11 AM - 3 PM) for strenuous routes</p>
              </div>
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-4">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-green-600 font-medium">Route looks safe!</p>
                <p className="text-sm text-gray-600">No major safety concerns detected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};