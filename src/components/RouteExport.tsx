import React, { useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { RouteData } from '../types';

interface RouteExportProps {
  routeData: RouteData | null;
  startLocation: any;
  endLocation: any;
}

export const RouteExport: React.FC<RouteExportProps> = ({
  routeData,
  startLocation,
  endLocation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!routeData || !startLocation || !endLocation) {
    return null;
  }

  const generateShareableUrl = () => {
    const params = new URLSearchParams({
      start: `${startLocation.lat},${startLocation.lng}`,
      end: `${endLocation.lat},${endLocation.lng}`,
      startName: startLocation.address,
      endName: endLocation.address,
    });
    
    return `${window.location.origin}?${params.toString()}`;
  };

  const exportToGPX = () => {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Route Elevation App">
  <trk>
    <name>Route from ${startLocation.address} to ${endLocation.address}</name>
    <trkseg>
${routeData.points.map(point => 
  `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <ele>${point.elevation}</ele>
      </trkpt>`
).join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route-elevation.gpx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyShareLink = async () => {
    const url = generateShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Share</h3>
      
      <div className="space-y-3">
        <button
          onClick={exportToGPX}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download GPX File</span>
        </button>

        <button
          onClick={copyShareLink}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Share Link</span>
            </>
          )}
        </button>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Route Summary:</p>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Distance:</strong> {(routeData.stats.totalDistance / 1000).toFixed(1)} km</div>
            <div><strong>Elevation Gain:</strong> {Math.round(routeData.stats.totalElevationGain)} m</div>
            <div><strong>Est. Time:</strong> {Math.round(routeData.stats.estimatedTime)} min</div>
          </div>
        </div>
      </div>
    </div>
  );
};