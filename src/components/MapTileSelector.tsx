import React, { useState } from 'react';
import { Map, Satellite, Layers, Mountain, Accessibility, Eye } from 'lucide-react';
import { MapTileOptions } from '../types';

interface MapTileSelectorProps {
  onTileChange: (options: MapTileOptions) => void;
  currentStyle: string;
}

export const MapTileSelector: React.FC<MapTileSelectorProps> = ({
  onTileChange,
  currentStyle,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle);

  const tileOptions = [
    {
      style: 'roadmap',
      label: 'Road Map',
      description: 'Standard road map with streets and labels',
      icon: Map,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      style: 'satellite',
      label: 'Satellite',
      description: 'High-resolution satellite imagery',
      icon: Satellite,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      style: 'hybrid',
      label: 'Hybrid',
      description: 'Satellite imagery with road overlays',
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      style: 'terrain',
      label: 'Terrain',
      description: 'Topographical map showing elevation',
      icon: Mountain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      style: 'accessibility',
      label: 'Accessibility',
      description: 'High contrast map for better visibility',
      icon: Accessibility,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      style: 'hiking',
      label: 'Hiking Trails',
      description: 'Specialized map showing hiking trails',
      icon: Mountain,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    onTileChange({ style: style as any });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-purple-600" />
          Map Style
        </h3>
        <p className="text-sm text-gray-600">Choose the best map view for your needs</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tileOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedStyle === option.style;
            
            return (
              <div
                key={option.style}
                onClick={() => handleStyleChange(option.style)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : option.bgColor}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{option.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Style Preview */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Current Style: {tileOptions.find(opt => opt.style === selectedStyle)?.label}
          </h4>
          <p className="text-sm text-gray-600">
            {tileOptions.find(opt => opt.style === selectedStyle)?.description}
          </p>
        </div>

        {/* Custom Tile Options */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Pro Tip</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use <strong>Terrain</strong> for elevation planning</li>
            <li>• Use <strong>Satellite</strong> for detailed ground features</li>
            <li>• Use <strong>Accessibility</strong> for better contrast</li>
            <li>• Use <strong>Hiking Trails</strong> for outdoor adventures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};