import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  Settings
} from 'lucide-react';
import { RouteData, VoiceGuidance as VoiceGuidanceType } from '../types';

interface VoiceGuidanceProps {
  routeData: RouteData | null;
  voiceSettings: VoiceGuidanceType;
  onSettingsChange: (settings: VoiceGuidanceType) => void;
}

export const VoiceGuidance: React.FC<VoiceGuidanceProps> = ({
  routeData,
  voiceSettings,
  onSettingsChange,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = voiceSettings.language;
        setRecognition(recognitionInstance);
      }

      if ('speechSynthesis' in window) {
        setSpeechSynthesis(window.speechSynthesis);
      }
    }
  }, [voiceSettings.language]);

  useEffect(() => {
    if (routeData && routeData.points.length > 0) {
      generateInstructions();
    }
  }, [routeData]);

  const generateInstructions = () => {
    if (!routeData) return;

    const newInstructions = [
      `Starting your journey. Total distance is ${(routeData.stats.totalDistance / 1000).toFixed(1)} kilometers.`,
      `Expected elevation gain is ${Math.round(routeData.stats.totalElevationGain)} meters.`,
      `Estimated travel time is ${Math.round(routeData.stats.estimatedTime)} minutes.`,
      'Stay on the marked route and follow safety guidelines.',
      'Enjoy your journey and stay safe!',
    ];

    // Add elevation-specific instructions
    if (routeData.stats.maxGrade > 15) {
      newInstructions.splice(2, 0, 'Warning: This route contains steep sections. Take breaks as needed.');
    }

    if (routeData.stats.maxElevation > 1500) {
      newInstructions.splice(2, 0, 'You will be traveling at high altitude. Stay hydrated and watch for altitude sickness symptoms.');
    }

    setInstructions(newInstructions);
    setCurrentInstruction(newInstructions[0] || '');
  };

  const startListening = () => {
    if (!recognition || !voiceSettings.enabled) return;

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      handleVoiceCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('next') || command.includes('forward')) {
      nextInstruction();
    } else if (command.includes('previous') || command.includes('back')) {
      previousInstruction();
    } else if (command.includes('repeat') || command.includes('again')) {
      speakInstruction(currentInstruction);
    } else if (command.includes('stop') || command.includes('pause')) {
      stopSpeaking();
    } else if (command.includes('start') || command.includes('play')) {
      speakInstruction(currentInstruction);
    } else if (command.includes('route info') || command.includes('statistics')) {
      speakRouteInfo();
    }
  };

  const speakInstruction = (text: string) => {
    if (!speechSynthesis || !voiceSettings.enabled) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceSettings.language;
    utterance.rate = voiceSettings.speed;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const nextInstruction = () => {
    const nextIndex = Math.min(instructionIndex + 1, instructions.length - 1);
    setInstructionIndex(nextIndex);
    setCurrentInstruction(instructions[nextIndex]);
    speakInstruction(instructions[nextIndex]);
  };

  const previousInstruction = () => {
    const prevIndex = Math.max(instructionIndex - 1, 0);
    setInstructionIndex(prevIndex);
    setCurrentInstruction(instructions[prevIndex]);
    speakInstruction(instructions[prevIndex]);
  };

  const speakRouteInfo = () => {
    if (!routeData) return;
    
    const info = `Route information: Distance ${(routeData.stats.totalDistance / 1000).toFixed(1)} kilometers, 
                  elevation gain ${Math.round(routeData.stats.totalElevationGain)} meters, 
                  estimated time ${Math.round(routeData.stats.estimatedTime)} minutes.`;
    speakInstruction(info);
  };

  if (!voiceSettings.enabled) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <VolumeX className="h-5 w-5 mr-2 text-gray-400" />
          Voice Guidance (Disabled)
        </h3>
        <p className="text-gray-500 text-sm">Enable voice guidance in accessibility settings</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Volume2 className="h-5 w-5 mr-2 text-blue-600" />
          Voice Guidance
        </h3>
        <p className="text-sm text-gray-600">Voice commands and audio instructions</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Instruction */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-2">Current Instruction</h4>
          <p className="text-gray-700 text-sm mb-3">{currentInstruction}</p>
          <div className="text-xs text-gray-500">
            Instruction {instructionIndex + 1} of {instructions.length}
          </div>
        </div>

        {/* Voice Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={previousInstruction}
            disabled={instructionIndex === 0}
            className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="h-5 w-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Previous</span>
          </button>

          <button
            onClick={() => isSpeaking ? stopSpeaking() : speakInstruction(currentInstruction)}
            className="flex flex-col items-center justify-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {isSpeaking ? (
              <>
                <Pause className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-xs text-blue-600">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-xs text-blue-600">Play</span>
              </>
            )}
          </button>

          <button
            onClick={nextInstruction}
            disabled={instructionIndex === instructions.length - 1}
            className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="h-5 w-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-600">Next</span>
          </button>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-green-100 hover:bg-green-200'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 text-red-600 mb-1" />
                <span className="text-xs text-red-600">Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 text-green-600 mb-1" />
                <span className="text-xs text-green-600">Listen</span>
              </>
            )}
          </button>
        </div>

        {/* Voice Commands Help */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Mic className="h-4 w-4 mr-2 text-green-600" />
            Voice Commands
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <p><strong>"Next"</strong> - Next instruction</p>
              <p><strong>"Previous"</strong> - Previous instruction</p>
              <p><strong>"Repeat"</strong> - Repeat current</p>
            </div>
            <div>
              <p><strong>"Stop"</strong> - Stop speaking</p>
              <p><strong>"Route info"</strong> - Route statistics</p>
              <p><strong>"Play"</strong> - Start speaking</p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 ${isListening ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Voice Recognition</span>
            </div>
            <div className={`flex items-center space-x-1 ${isSpeaking ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span>Speaking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};