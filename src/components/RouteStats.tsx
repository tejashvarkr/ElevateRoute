import React from 'react';
import { TrendingUp, TrendingDown, Mountain, Route, Gauge, Clock } from 'lucide-react';
import { RouteStats as RouteStatsType } from '../types';

interface RouteStatsProps {
  stats: RouteStatsType | null;
}

export const RouteStats: React.FC<RouteStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const formatElevation = (elevation: number) => {
    return `${Math.round(elevation)} m`;
  };

  const formatGrade = (grade: number) => {
    return `${grade.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const statItems = [
    {
      label: 'Total Distance',
      value: formatDistance(stats.totalDistance),
      icon: Route,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Estimated Time',
      value: formatTime(stats.estimatedTime),
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      label: 'Elevation Gain',
      value: formatElevation(stats.totalElevationGain),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Elevation Loss',
      value: formatElevation(stats.totalElevationLoss),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'Max Elevation',
      value: formatElevation(stats.maxElevation),
      icon: Mountain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Max Grade',
      value: formatGrade(stats.maxGrade),
      icon: Gauge,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Route Statistics</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="text-center p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.bgColor} mb-3`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-gray-800">{item.value}</p>
              </div>
            );
          })}
        </div>
        
        {stats.totalDistance > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Min Elevation:</span>
                <span className="ml-2 font-medium">{formatElevation(stats.minElevation)}</span>
              </div>
              <div>
                <span className="text-gray-600">Min Grade:</span>
                <span className="ml-2 font-medium">{formatGrade(stats.minGrade)}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Grade:</span>
                <span className="ml-2 font-medium">{formatGrade(stats.averageGrade)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};