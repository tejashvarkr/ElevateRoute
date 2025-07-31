import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  Volume2, 
  Eye, 
  Hand, 
  Mic, 
  Type, 
  Contrast,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import { AccessibilityFeatures, VoiceGuidance } from '../types';

interface AccessibilityPanelProps {
  onFeaturesChange: (features: AccessibilityFeatures) => void;
  onVoiceGuidanceChange: (guidance: VoiceGuidance) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  onFeaturesChange,
  onVoiceGuidanceChange,
}) => {
  const [features, setFeatures] = useState<AccessibilityFeatures>({
    wheelchairAccessible: false,
    audioDescriptions: false,
    visualIndicators: true,
    tactileFeedback: false,
    voiceNavigation: false,
    highContrast: false,
    largeFonts: false,
  });

  const [voiceGuidance, setVoiceGuidance] = useState<VoiceGuidance>({
    enabled: false,
    language: 'en-US',
    speed: 1.0,
    volume: 0.8,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleFeatureToggle = (feature: keyof AccessibilityFeatures) => {
    const newFeatures = { ...features, [feature]: !features[feature] };
    setFeatures(newFeatures);
    onFeaturesChange(newFeatures);

    // Apply immediate UI changes
    if (feature === 'highContrast') {
      document.body.classList.toggle('high-contrast', newFeatures.highContrast);
    }
    if (feature === 'largeFonts') {
      document.body.classList.toggle('large-fonts', newFeatures.largeFonts);
    }
  };

  const handleVoiceGuidanceChange = (key: keyof VoiceGuidance, value: any) => {
    const newGuidance = { ...voiceGuidance, [key]: value };
    setVoiceGuidance(newGuidance);
    onVoiceGuidanceChange(newGuidance);
  };

  const testVoiceGuidance = () => {
    if (!speechSynthesis || !voiceGuidance.enabled) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "Welcome to the accessible route planner. Voice guidance is now active. You can navigate using voice commands and receive audio descriptions of your route."
    );
    
    utterance.lang = voiceGuidance.language;
    utterance.rate = voiceGuidance.speed;
    utterance.volume = voiceGuidance.volume;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const accessibilityOptions = [
    {
      key: 'wheelchairAccessible' as keyof AccessibilityFeatures,
      label: 'Wheelchair Accessible Routes',
      description: 'Find routes with ramps and avoid stairs',
      icon: Accessibility,
      color: 'text-blue-600',
    },
    {
      key: 'audioDescriptions' as keyof AccessibilityFeatures,
      label: 'Audio Descriptions',
      description: 'Detailed audio descriptions of surroundings',
      icon: Volume2,
      color: 'text-green-600',
    },
    {
      key: 'visualIndicators' as keyof AccessibilityFeatures,
      label: 'Enhanced Visual Indicators',
      description: 'High contrast markers and clear visual cues',
      icon: Eye,
      color: 'text-purple-600',
    },
    {
      key: 'tactileFeedback' as keyof AccessibilityFeatures,
      label: 'Tactile Feedback',
      description: 'Vibration alerts for navigation cues',
      icon: Hand,
      color: 'text-orange-600',
    },
    {
      key: 'voiceNavigation' as keyof AccessibilityFeatures,
      label: 'Voice Navigation',
      description: 'Navigate using voice commands',
      icon: Mic,
      color: 'text-red-600',
    },
    {
      key: 'highContrast' as keyof AccessibilityFeatures,
      label: 'High Contrast Mode',
      description: 'Improved visibility with high contrast colors',
      icon: Contrast,
      color: 'text-gray-600',
    },
    {
      key: 'largeFonts' as keyof AccessibilityFeatures,
      label: 'Large Fonts',
      description: 'Increased text size for better readability',
      icon: Type,
      color: 'text-indigo-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Accessibility className="h-5 w-5 mr-2 text-blue-600" />
          Accessibility Features
        </h3>
        <p className="text-sm text-gray-600">Customize your experience for better accessibility</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Accessibility Options */}
        <div className="space-y-4">
          {accessibilityOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = features[option.key];
            
            return (
              <div
                key={option.key}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  isEnabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFeatureToggle(option.key)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? 'text-blue-600' : option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{option.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isEnabled ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isEnabled && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voice Guidance Settings */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice Guidance Settings
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Voice Guidance</label>
              <button
                onClick={() => handleVoiceGuidanceChange('enabled', !voiceGuidance.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceGuidance.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    voiceGuidance.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {voiceGuidance.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={voiceGuidance.language}
                    onChange={(e) => handleVoiceGuidanceChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="it-IT">Italian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Speed: {voiceGuidance.speed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceGuidance.speed}
                    onChange={(e) => handleVoiceGuidanceChange('speed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(voiceGuidance.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceGuidance.volume}
                    onChange={(e) => handleVoiceGuidanceChange('volume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={testVoiceGuidance}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Stop Test</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Test Voice</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};