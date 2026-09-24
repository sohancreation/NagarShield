/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  MapPin,
  Globe,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Minus,
  Maximize2,
  Minimize2,
  X,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Building2,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Key,
} from 'lucide-react';
import { ChatMessage, GroundingSource, ChatRole, UrbanDataContext } from '../types';
import { sendChatMessage, transcribeAudioBlob } from '../services/geminiService';
import { saveStoredGeminiKey } from '../services/clientGemini';
import { ApiKeyModal } from './ApiKeyModal';

interface GeminiChatbotProps {
  selectedCity: string;
  urbanContext?: UrbanDataContext;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onClose?: () => void;
}

const AVAILABLE_ROLES: ChatRole[] = [
  {
    id: 'resilience_specialist',
    name: 'Resilience Specialist',
    title: 'Cross-Hazard Urban Planner',
    description: 'Specializes in compounding flood risk, asphalt heat index, and traffic bottlenecks.',
    iconName: 'ShieldCheck',
    systemInstruction: 'Focus on multi-hazard urban planning, flood resilience, and infrastructure mitigation in Bangladesh.',
    suggestedQuestions: [
      'Analyze the compound impact between a 40mm downpour and peak evening traffic in Dhaka.',
      'Which urban corridors should be prioritized for permeable bioswales and tree canopies?',
      'Formulate immediate mitigation for waterlogging along Rokeya Sarani and Mirpur 10.',
    ],
  },
  {
    id: 'emergency_dispatch',
    name: 'Emergency Dispatcher',
    title: 'Life-Safety & Corridor Navigator',
    description: 'Prioritizes critical trauma centers, ambulance routing, and flood-inundated bypasses.',
    iconName: 'AlertTriangle',
    systemInstruction: 'Focus on emergency vehicle access, hospital triage routes, and flood barricades.',
    suggestedQuestions: [
      'Locate emergency hospitals near flooded arterial corridors using Google Maps.',
      'What is the safest evacuation bypass around waterlogged underpasses in Dhaka?',
      'Formulate a 4-step emergency transit diversion protocol for monsoon surges.',
    ],
  },
  {
    id: 'drainage_engineer',
    name: 'Drainage Engineer',
    title: 'Hydrology & Stormwater Infrastructure',
    description: 'Expertise in culverts, drainage surcharge, storm pumps, and sponge-city retrofits.',
    iconName: 'Building2',
    systemInstruction: 'Focus on hydraulic metrics, culvert discharge capacity, and pavement drainage.',
    suggestedQuestions: [
      'Calculate required retention pond volume for a 60% impervious commercial zone.',
      'Evaluate micro-drainage gravity vs DWASA pump station upgrades for flood relief.',
      'How does standing water film reduce vehicular braking friction on asphalt?',
    ],
  },
  {
    id: 'citizen_guide',
    name: 'Citizen Commuter Guide',
    title: 'Public Transit & Weather Commute',
    description: 'Practical, safe travel guidance balancing route heat exposure, water depth, and travel time.',
    iconName: 'Compass',
    systemInstruction: 'Provide friendly, actionable commuter guidance for pedestrians, MRT-6 riders, and transit users.',
    suggestedQuestions: [
      'Is Dhaka Metro MRT-6 running normally during heavy rains?',
      'What is the best shaded walking route to avoid high asphalt surface temperatures?',
      'How should commuters navigate severe waterlogged intersections safely?',
    ],
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  selectedCity,
  urbanContext,
  initialPrompt,
  onClearInitialPrompt,
  onClose,
}) => {
  // Window state: minimized, maximized
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Persona & Model Selection
  const [selectedRole, setSelectedRole] = useState<string>('resilience_specialist');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'maps' | 'search'>('none');

  // Messages and Input
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'model',
      content: `Hello! I am your **NagarShield AI Urban Copilot** for **${selectedCity}**.\n\nI can analyze compounding flood risks, investigate road congestion, route emergency vehicles, and ground inquiries with real-time **Google Maps** spatial data or **Google Search** web intelligence. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.5-flash',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Recording & Voice Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Initial Prompt passed into Copilot
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isMinimized]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Voice Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioTranscription(audioBlob);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied or unsupported:', err);
      alert('Microphone access could not be acquired. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudioTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const transcription = await transcribeAudioBlob(blob);
      if (transcription && transcription.text && transcription.text.trim()) {
        const recognizedText = transcription.text.trim();
        setInputText((prev) => (prev ? `${prev} ${recognizedText}` : recognizedText));
      }
    } catch (err: any) {
      console.error('Audio transcription failed:', err);
      alert('Unable to transcribe voice audio. Please try typing your prompt.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioTranscription(file);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Detect if user pasted a Gemini API Key directly into chat
    if (text.startsWith('AIzaSy') && text.length > 25) {
      saveStoredGeminiKey(text);
      setInputText('');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: 'Updated Gemini API Key: `AIzaSy...`',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `key-confirm-${Date.now()}`,
          role: 'model',
          content: `🔑 **Gemini API Key Successfully Configured!**\n\nYour new Gemini API key has been securely saved to browser storage and is now active across all platform AI services (Chatbot, Planner Dashboard, Healthcare Triage, and Hazard Scanner).\n\nYou can now ask any question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const currentRoleObj = AVAILABLE_ROLES.find((r) => r.id === selectedRole) || AVAILABLE_ROLES[0];

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const activeModelToUse = groundingMode !== 'none' ? 'gemini-3.5-flash' : selectedModel;

      const response = await sendChatMessage(
        chatHistory,
        activeModelToUse,
        selectedRole,
        groundingMode,
        selectedCity,
        undefined,
        urbanContext
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: activeModelToUse,
        groundingType: groundingMode,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Operational Alert:** Unable to receive response from the AI assistant. (${err.message || 'Network error'}). Please verify connectivity or retry with another grounding mode.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
        groundingType: groundingMode,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentRole = AVAILABLE_ROLES.find((r) => r.id === selectedRole) || AVAILABLE_ROLES[0];

  // Minimized docked floating capsule
  if (isMinimized) {
    return (
      <div className="fixed bottom-18 sm:bottom-5 right-3 sm:right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-900 border border-slate-700/80 rounded-full shadow-2xl text-white cursor-pointer backdrop-blur-md transition group hover:border-sky-500/60"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              AI Urban Copilot
              <span className="text-[10px] text-sky-400 font-normal">({currentRole.name})</span>
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
              {selectedCity}
            </span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-800 text-slate-400">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 rounded-md hover:bg-slate-800 hover:text-white transition"
              title="Expand Window"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-md hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Close Copilot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Floating Popup Window (Normal or Maximized)
  return (
    <div
      id="copilot-popup-window"
      className={`fixed z-50 transition-all duration-200 flex flex-col bg-white rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden font-sans ${
        isMaximized
          ? 'bottom-16 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto top-2 sm:top-auto sm:w-[840px] sm:h-[840px] sm:max-h-[92vh]'
          : 'bottom-16 sm:bottom-5 right-2 sm:right-5 left-2 sm:left-auto w-auto sm:w-[490px] md:w-[530px] h-[560px] sm:h-[640px] max-h-[82vh] sm:max-h-[88vh]'
      }`}
    >
      {/* Title Bar (Dark, Sleek, Draggable feel) */}
      <div className="bg-[#0b0f19] px-4 py-3 border-b border-slate-800/80 flex items-center justify-between text-white shrink-0 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <h3 className="text-xs font-bold text-slate-100 tracking-tight">AI Urban Copilot</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-sky-400 font-mono font-medium px-1 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">
                PROMPT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-1 font-mono">
              <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              {selectedCity}
            </p>
          </div>
        </div>

        {/* Window Controls: Key, Role Info, Minimize, Maximize, Close */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="p-1.5 rounded-lg text-xs transition cursor-pointer hover:bg-slate-800 text-amber-400 hover:text-amber-300"
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowRoleInfo(!showRoleInfo)}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              showRoleInfo ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Toggle persona & role parameters"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: 'welcome-reset',
                  role: 'model',
                  content: `Conversation reset. Ready for inquiries under: **${currentRole.name}** for **${selectedCity}**.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  model: selectedModel,
                },
              ])
            }
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
            title="Minimize to pill"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer hidden sm:block"
            title={isMaximized ? 'Restore size' : 'Expand window'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
              title="Close Copilot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Settings & Persona Toolbar */}
      <div className="bg-[#101726] border-b border-slate-800/80 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          {/* Persona selector */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg pl-2 pr-6 py-1 text-[11px] font-medium appearance-none focus:outline-none focus:border-sky-500 cursor-pointer"
              title="Select AI specialist persona"
            >
              {AVAILABLE_ROLES.map((role) => (
                <option key={role.id} value={role.id} className="bg-slate-900 text-white">
                  {role.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          {/* Model selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            disabled={groundingMode !== 'none'}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-sky-500 cursor-pointer hidden sm:inline-block"
            title="Gemini Foundation Model"
          >
            <option value="gemini-3.5-flash" className="bg-slate-900 text-white">
              Flash 3.5
            </option>
            <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-white">
              Pro 3.1
            </option>
            <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">
              Flash Lite 3.1
            </option>
          </select>
        </div>

        {/* Grounding Mode Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setGroundingMode('none')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
              groundingMode === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => {
              setGroundingMode('maps');
              setSelectedModel('gemini-3.5-flash');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              groundingMode === 'maps'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
            title="Real-time Google Maps Grounding"
          >
            <MapPin className="w-2.5 h-2.5" />
            Maps
          </button>
          <button
            type="button"
            onClick={() => {
              setGroundingMode('search');
              setSelectedModel('gemini-3.5-flash');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer ${
              groundingMode === 'search'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-400 hover:text-sky-300'
            }`}
            title="Real-time Google Search Grounding"
          >
            <Globe className="w-2.5 h-2.5" />
            Search
          </button>
        </div>
      </div>

      {/* Role Bio banner when expanded */}
      {showRoleInfo && (
        <div className="bg-slate-900/95 text-slate-300 px-3.5 py-2 border-b border-slate-800 text-[11px] flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-400">{currentRole.name}:</span>
            <span className="text-slate-300">{currentRole.description}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowRoleInfo(false)}
            className="text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        id="copilot-popup-messages"
        className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
      >
        {/* Suggested Inquiries horizontal chips */}
        {showSuggestions && messages.length <= 2 && (
          <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick Prompts for {currentRole.name}:
              </span>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {currentRole.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="text-left text-[11px] bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-600 p-2 rounded-lg border border-slate-200/70 transition cursor-pointer leading-tight truncate"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] shadow-xs ${
                  isUser ? 'bg-sky-600' : 'bg-slate-900 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-sky-400" />}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl p-3 text-xs leading-relaxed shadow-2xs relative group max-w-full ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px]">
                  <span className="font-semibold">{isUser ? 'You' : 'Copilot'}</span>
                  <div className="flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown content */}
                <div className={`prose prose-xs max-w-none break-words ${isUser ? 'text-white' : 'text-slate-800'}`}>
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Grounding Sources (Google Maps / Google Search links) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px]">
                    <div className="font-bold text-slate-600 mb-1 flex items-center gap-1">
                      {msg.groundingType === 'maps' ? (
                        <>
                          <MapPin className="w-2.5 h-2.5 text-emerald-600" /> Google Maps Sources:
                        </>
                      ) : (
                        <>
                          <Globe className="w-2.5 h-2.5 text-sky-600" /> Search Grounding Sources:
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded text-[10px] border border-slate-200 transition"
                        >
                          <span className="truncate max-w-[150px]">{src.title}</span>
                          <ExternalLink className="w-2 h-2 opacity-60 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center shrink-0 text-white font-bold text-[10px] shadow-xs">
              <Bot className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-2xs text-xs text-slate-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-slate-600 text-[11px]">
                {groundingMode === 'maps'
                  ? 'Spatial grounding with Google Maps...'
                  : groundingMode === 'search'
                  ? 'Querying live Google Search...'
                  : `Consulting ${selectedModel}...`}
              </span>
            </div>
          </div>
        )}

        {/* Transcribing Indicator */}
        {isTranscribing && (
          <div className="flex gap-2 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center shrink-0 text-white text-[10px]">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-white border border-rose-200 rounded-2xl rounded-tl-none p-3 shadow-2xs text-xs text-rose-700 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-rose-600" />
              <span className="font-semibold text-[11px]">Transcribing audio...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Voice Recording Bar */}
      {isRecording && (
        <div className="bg-rose-50 border-t border-rose-200 px-3 py-2 flex items-center justify-between text-xs text-rose-800 animate-pulse shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-ping" />
            <span className="font-bold text-[11px]">Recording Voice:</span>
            <span className="font-mono bg-white px-1.5 py-0.2 rounded border border-rose-200 text-[11px]">
              {Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <MicOff className="w-3 h-3" />
            Done
          </button>
        </div>
      )}

      {/* Bottom Chat Input Form */}
      <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          {/* Microphone button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border-slate-300'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice input (Mic)'}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          {/* Upload audio file button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTranscribing || isRecording}
            className="p-2 rounded-xl border bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-600 border-slate-300 transition cursor-pointer shrink-0"
            title="Upload audio recording to transcribe"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="copilot-popup-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isRecording
                  ? 'Listening...'
                  : groundingMode === 'maps'
                  ? 'Ask with Google Maps grounding...'
                  : groundingMode === 'search'
                  ? 'Ask with Google Search grounding...'
                  : `Ask ${currentRole.name}...`
              }
              disabled={isLoading || isRecording}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim() || isRecording}
            className="p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-xl transition shadow-xs cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
      {/* API Key Modal */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </div>
  );
};
