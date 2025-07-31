import React from 'react';
import { Car, Bike, User } from 'lucide-react';
import { TravelMode } from '../types';

interface TravelModeSelectorProps {
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
}

const TRAVEL_MODES = [
  { value: 'WALKING' as TravelMode, label: 'Walking', icon: User },
  { value: 'BICYCLING' as TravelMode, label: 'Cycling', icon: Bike },
  { value: 'DRIVING' as TravelMode, label: 'Driving', icon: Car },
];

export const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Travel Mode</label>
      <div className="grid grid-cols-3 gap-2">
        {TRAVEL_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = value === mode.value;
          
          return (
            <button
              key={mode.value}
              onClick={() => onChange(mode.value)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white/50 text-gray-600 hover:border-gray-300 hover:bg-white/70'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};