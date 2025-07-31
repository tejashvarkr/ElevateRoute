import React, { useState } from 'react';
import { Plus, X, MapPin } from 'lucide-react';
import { LocationData } from '../types';
import { LocationInput } from './LocationInput';

interface WaypointManagerProps {
  waypoints: LocationData[];
  onChange: (waypoints: LocationData[]) => void;
  map: google.maps.Map | null;
}

export const WaypointManager: React.FC<WaypointManagerProps> = ({
  waypoints,
  onChange,
  map,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const addWaypoint = () => {
    onChange([...waypoints, { address: '', lat: 0, lng: 0 }]);
    setIsExpanded(true);
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    onChange(newWaypoints);
    if (newWaypoints.length === 0) {
      setIsExpanded(false);
    }
  };

  const updateWaypoint = (index: number, waypoint: LocationData | null) => {
    if (!waypoint) {
      removeWaypoint(index);
      return;
    }
    
    const newWaypoints = [...waypoints];
    newWaypoints[index] = waypoint;
    onChange(newWaypoints);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Waypoints</h3>
        <button
          onClick={addWaypoint}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stop</span>
        </button>
      </div>

      {(isExpanded || waypoints.length > 0) && (
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={index} className="relative">
              <LocationInput
                label={`Stop ${index + 1}`}
                placeholder="Enter waypoint"
                value={waypoint.address ? waypoint : null}
                onChange={(location) => updateWaypoint(index, location)}
                map={map}
              />
              <button
                onClick={() => removeWaypoint(index)}
                className="absolute top-8 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {waypoints.length > 0 && (
        <div className="text-xs text-gray-500 flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          Route will be optimized for the best path through all stops
        </div>
      )}
    </div>
  );
};