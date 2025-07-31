import React, { useRef, useEffect, useState } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { LocationData } from '../types';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  map: google.maps.Map | null;
  onSearch?: () => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  map,
  onSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!map || !inputRef.current || !window.google?.maps?.places) return;

    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (place.geometry?.location) {
        const location: LocationData = {
          address: place.formatted_address || place.name || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onChange(location);
        setInputValue(location.address);
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [map, onChange]);

  const handleClear = () => {
    onChange(null);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Update input value when location changes externally
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value?.address || '';
      setInputValue(value?.address || '');
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {onSearch && (
            <button
              onClick={handleSearch}
              className="px-3 py-1 mr-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
            >
              <Search className="h-3 w-3" />
              <span>Search</span>
            </button>
          )}
          {value && (
            <button
              onClick={handleClear}
              className="pr-3 flex items-center hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};