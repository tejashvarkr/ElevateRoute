import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Heart, 
  Shield,
  Navigation,
  Clock,
  Users
} from 'lucide-react';
import { RouteData, EmergencyInfo } from '../types';
import { RouteService } from '../services/routeService';

interface EmergencyPanelProps {
  routeData: RouteData | null;
  routeService: RouteService | null;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({
  routeData,
  routeService,
}) => {
  const [emergencyInfo, setEmergencyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeData || !routeService || routeData.points.length === 0) {
      setEmergencyInfo(null);
      return;
    }

    const fetchEmergencyInfo = async () => {
      setLoading(true);
      try {
        const info = await routeService.getEmergencyInfo(routeData.points);
        setEmergencyInfo(info);
      } catch (error) {
        console.error('Error fetching emergency info:', error);
        setEmergencyInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyInfo();
  }, [routeData, routeService]);

  const emergencyContacts = [
    { label: 'Emergency Services', number: '911', icon: Phone, color: 'text-red-600' },
    { label: 'Poison Control', number: '1-800-222-1222', icon: Heart, color: 'text-purple-600' },
    { label: 'Roadside Assistance', number: 'AAA: 1-800-AAA-HELP', icon: Shield, color: 'text-blue-600' },
  ];

  if (!routeData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Emergency Information
        </h3>
        <p className="text-gray-500 text-sm">Plan a route to see emergency services</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          Emergency Information
        </h3>
        <p className="text-sm text-gray-600">Essential emergency contacts and nearby services</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Emergency Contacts */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Phone className="h-4 w-4 mr-2 text-red-600" />
            Emergency Contacts
          </h4>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${contact.color}`} />
                    <span className="font-medium text-gray-800">{contact.label}</span>
                  </div>
                  <a
                    href={`tel:${contact.number.replace(/[^\d]/g, '')}`}
                    className="text-blue-600 hover:text-blue-700 font-mono text-sm"
                  >
                    {contact.number}
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nearest Medical Facilities */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ) : emergencyInfo && emergencyInfo.nearestHospital ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-blue-600" />
              Nearest Medical Facility
            </h4>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">{emergencyInfo.nearestHospital.name}</h5>
                  {emergencyInfo.nearestHospital.vicinity && (
                    <p className="text-sm text-gray-600 mt-1">{emergencyInfo.nearestHospital.vicinity}</p>
                  )}
                  {emergencyInfo.nearestHospital.rating && (
                    <div className="flex items-center space-x-1 mt-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600">{emergencyInfo.nearestHospital.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/place/?q=place_id:${emergencyInfo.nearestHospital.place_id}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Police Stations */}
        {emergencyInfo && emergencyInfo.policeStations && emergencyInfo.policeStations.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              Nearby Police Stations
            </h4>
            <div className="space-y-2">
              {emergencyInfo.policeStations.map((station: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">{station.name}</h5>
                      {station.vicinity && (
                        <p className="text-sm text-gray-600">{station.vicinity}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/place/?q=place_id:${station.place_id}`;
                        window.open(url, '_blank');
                      }}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1"
                    >
                      <Navigation className="h-3 w-3" />
                      <span>Directions</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Preparedness */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2 text-orange-600" />
            Emergency Preparedness
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Before You Go:</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Share your route with someone</li>
                <li>• Check weather conditions</li>
                <li>• Ensure phone is fully charged</li>
                <li>• Carry emergency supplies</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">In Case of Emergency:</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Call 911 immediately</li>
                <li>• Share your exact location</li>
                <li>• Stay calm and follow instructions</li>
                <li>• Use emergency whistle if available</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Location Sharing */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-purple-600" />
            Share Your Location
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            Share your real-time location with trusted contacts for added safety.
          </p>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                  const { latitude, longitude } = position.coords;
                  const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  navigator.clipboard.writeText(locationUrl).then(() => {
                    alert('Location copied to clipboard! Share this with your emergency contact.');
                  });
                });
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <MapPin className="h-4 w-4" />
            <span>Copy Current Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};