import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, X, Loader2, Volume2, Radio } from 'lucide-react';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../services/audio';

interface LiveVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  const [volume, setVolume] = useState(0);

  // Audio Context Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null); // To hold the active session

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  const startSession = async () => {
    try {
      setIsError(false);
      
      // 1. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 2. Setup Audio Contexts
      // Input must be 16kHz for Gemini
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output is typically 24kHz from Gemini
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      // 3. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 4. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            
            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume visualization calculation
              let sum = 0;
              for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1)); // Scale for UI

              const pcmBlob = createPcmBlob(inputData);
              
              // Send to Gemini
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = scriptProcessor;
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputContextRef.current) {
              const ctx = outputContextRef.current;
              
              // Ensure playback scheduling is smooth
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBytes = base64ToUint8Array(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              // Stop all currently playing audio
              sourcesRef.current.forEach(src => {
                try { src.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsError(true);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are AgriSmart, a friendly and concise farming assistant. You are talking to a farmer. Keep answers short and spoken-style.",
        },
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start session:", error);
      setIsError(true);
    }
  };

  const stopSession = () => {
    // 1. Close Microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 2. Disconnect Audio Nodes
    if (processorRef.current && inputContextRef.current) {
      processorRef.current.disconnect();
      sourceRef.current?.disconnect();
    }

    // 3. Close Audio Contexts
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();

    // 4. Close Gemini Session
    // (There isn't an explicit client-side close method on the promise wrapper in this SDK version, 
    // but stopping the input stream essentially ends the user side interaction)
    
    setIsConnected(false);
    setVolume(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 w-full max-w-md rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2 text-green-400">
             <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse' : ''}`} />
             <span className="font-semibold tracking-wide text-sm uppercase">Live Mode</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="h-64 flex flex-col items-center justify-center relative">
          
          {isError ? (
            <div className="text-center px-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MicOff className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-400 font-medium">Connection Failed</p>
              <p className="text-gray-500 text-sm mt-2">Please check your microphone and try again.</p>
              <button 
                onClick={startSession}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Ripple Effect */}
              {isConnected && (
                <>
                  <div 
                    className="absolute bg-green-500/20 rounded-full transition-all duration-75"
                    style={{ width: `${100 + volume * 200}px`, height: `${100 + volume * 200}px` }}
                  />
                  <div 
                    className="absolute bg-green-500/40 rounded-full transition-all duration-100"
                    style={{ width: `${90 + volume * 150}px`, height: `${90 + volume * 150}px` }}
                  />
                </>
              )}

              {/* Main Icon */}
              <div className={`
                relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-500
                ${isConnected ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-700'}
              `}>
                {!isConnected ? (
                  <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>

              <div className="mt-8 text-center">
                <h3 className="text-white text-xl font-medium">
                  {isConnected ? "Listening..." : "Connecting..."}
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Speak naturally to your assistant
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 p-6 flex justify-center border-t border-gray-700">
           <button 
             onClick={onClose}
             className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors"
           >
             <MicOff className="w-5 h-5" />
             End Session
           </button>
        </div>
      </div>
    </div>
  );
};
