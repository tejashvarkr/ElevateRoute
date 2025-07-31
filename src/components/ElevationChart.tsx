import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RouteData } from '../types';
import { CHART_COLORS } from '../config/maps';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ElevationChartProps {
  routeData: RouteData | null;
  onPointHover?: (pointIndex: number | null) => void;
  highlightedPoint?: number | null;
}

export const ElevationChart: React.FC<ElevationChartProps> = ({
  routeData,
  onPointHover,
  highlightedPoint,
}) => {
  if (!routeData || routeData.points.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-2 opacity-20">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Select a route to view elevation profile</p>
        </div>
      </div>
    );
  }

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatElevation = (elevation: number) => {
    return `${Math.round(elevation)}m`;
  };

  // Create point colors array for highlighting
  const pointColors = routeData.points.map((_, index) => 
    index === highlightedPoint ? '#EF4444' : CHART_COLORS.primary
  );

  const pointRadii = routeData.points.map((_, index) => 
    index === highlightedPoint ? 8 : 0
  );
  const data = {
    labels: routeData.points.map(point => formatDistance(point.distance)),
    datasets: [
      {
        label: 'Elevation',
        data: routeData.points.map(point => point.elevation),
        borderColor: CHART_COLORS.primary,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${CHART_COLORS.gradient.start}40`);
          gradient.addColorStop(1, `${CHART_COLORS.gradient.end}10`);
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: pointRadii,
        pointHoverRadius: 6,
        pointBackgroundColor: pointColors,
        pointHoverBackgroundColor: pointColors,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const point = routeData.points[context[0].dataIndex];
            return `Distance: ${formatDistance(point.distance)}`;
          },
          label: (context: any) => {
            return `Elevation: ${formatElevation(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Distance',
          color: CHART_COLORS.text,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: CHART_COLORS.grid,
          lineWidth: 1,
        },
        ticks: {
          color: CHART_COLORS.text,
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Elevation (m)',
          color: CHART_COLORS.text,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: CHART_COLORS.grid,
          lineWidth: 1,
        },
        ticks: {
          color: CHART_COLORS.text,
          callback: (value: any) => formatElevation(value),
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onHover: (event: any, activeElements: any[]) => {
      if (onPointHover) {
        const pointIndex = activeElements.length > 0 ? activeElements[0].index : null;
        onPointHover(pointIndex);
      }
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Elevation Profile</h3>
        <p className="text-sm text-gray-600">
          Hover over the chart to see details along the route
        </p>
      </div>
      <div className="p-6">
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
};