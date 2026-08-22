'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, AlertCircle, Sparkles, VolumeX } from 'lucide-react';
import { GeminiLiveClient, VoiceState } from '@/lib/voice/gemini-live-client';

/**
 * Clean Markdown, HTML tags, Emojis, and Symbols for Natural TTS Speech
 */
function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  let clean = text.replace(/<[^>]*>?/gm, ''); // strip HTML
  clean = clean.replace(/```[\s\S]*?```/g, ''); // strip code blocks
  clean = clean.replace(/`[^`]*`/g, ''); // strip inline code
  clean = clean.replace(/#\w+/g, ''); // strip hashtags
  clean = clean.replace(/[#\*\_~>-]/g, ' '); // strip markdown symbols
  clean = clean.replace(/https?:\/\/\S+/g, ''); // strip URLs
  clean = clean.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // strip emojis

  // Strip repetitive self-naming boilerplate unless asked for name
  if (!/(اسمك|اسمك ايه|شو اسمك|what is your name|who are you)/i.test(clean)) {
    clean = clean.replace(/(أنا|انا)\s*(Olive|أوليف|اوليف)/gi, '');
    clean = clean.replace(/\b(I am|my name is)\s*Olive\b/gi, '');
  }

  return clean.replace(/\s+/g, ' ').trim();
}

/**
 * High-Quality Automated Voice Playback Engine (TTS Stream / Web Audio)
 */
export function playSpokenAudioResponse(textToSpeak: string, onEndCallback?: () => void): SpeechSynthesisUtterance | null {
  const sanitizedText = cleanTextForSpeech(textToSpeak);
  if (!sanitizedText) return null;

  const isArabic = /[\u0600-\u06FF]/.test(sanitizedText);
  return playBrowserSpeechSynthesisFallback(sanitizedText, isArabic, onEndCallback);
}

/**
 * Fallback Web SpeechSynthesis Engine
 */
function playBrowserSpeechSynthesisFallback(
  text: string,
  isArabic: boolean,
  onEndCallback?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchingVoice = voices.find((v) =>
        isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
      );
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
      utterance.onerror = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('[Browser SpeechSynthesis Error]', err);
    if (onEndCallback) onEndCallback();
    return null;
  }
}

export function LiveAssistantWidget() {
  const [state, setState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioTtsEnabled, setIsAudioTtsEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientRef = useRef<GeminiLiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Unblock browser AudioContext on user interaction
  const unblockBrowserAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  };

  useEffect(() => {
    clientRef.current = new GeminiLiveClient({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'speaking') {
          setIsPlayingAudio(true);
        } else if (newState === 'listening' || newState === 'idle') {
          setIsPlayingAudio(false);
        }
        if (newState !== 'error') {
          setErrorMessage(null);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    // Expose global speak response function for ERP chat responses
    if (typeof window !== 'undefined') {
      (window as unknown as { playErpAiVoiceResponse: typeof playSpokenAudioResponse }).playErpAiVoiceResponse = (
        text: string
      ) => {
        if (!isAudioTtsEnabled) return null;
        unblockBrowserAudio();
        setIsPlayingAudio(true);
        return playSpokenAudioResponse(text, () => setIsPlayingAudio(false));
      };
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [isAudioTtsEnabled]);

  const handleToggleCall = () => {
    unblockBrowserAudio();
    if (!clientRef.current) return;

    if (state === 'idle' || state === 'error') {
      clientRef.current.connect();
    } else {
      clientRef.current.disconnect();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    unblockBrowserAudio();
    if (clientRef.current) {
      const muted = clientRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleToggleTts = (e: React.MouseEvent) => {
    e.stopPropagation();
    unblockBrowserAudio();
    setIsAudioTtsEnabled((prev) => !prev);
  };

  const isActive = state === 'connecting' || state === 'listening' || state === 'speaking';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Active Call & Voice Status Card */}
      {(isActive || isPlayingAudio) && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/50 bg-slate-900/95 px-4 py-3 text-slate-100 shadow-2xl backdrop-blur-md transition-all duration-300">
          <div className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                state === 'speaking' || isPlayingAudio
                  ? 'bg-emerald-400'
                  : state === 'listening'
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
            />
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                state === 'speaking' || isPlayingAudio
                  ? 'bg-emerald-500'
                  : state === 'listening'
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Vara Live 2.0
            </span>
            <span className="text-sm font-medium text-slate-200">
              {state === 'connecting' && 'جاري الاتصال...'}
              {state === 'listening' && '🟢 Vara Live متصل'}
              {(state === 'speaking' || isPlayingAudio) && 'فارا تتحدث الآن...'}
            </span>
          </div>

          {/* Equalizer Soundwave Animation */}
          {(state === 'speaking' || isPlayingAudio || state === 'listening') && (
            <div className="flex items-end gap-1 px-1 h-5">
              <span className="h-3 w-1 animate-[bounce_1s_infinite_100ms] rounded-full bg-amber-400" />
              <span className="h-5 w-1 animate-[bounce_1s_infinite_300ms] rounded-full bg-amber-400" />
              <span className="h-2 w-1 animate-[bounce_1s_infinite_200ms] rounded-full bg-amber-400" />
              <span className="h-4 w-1 animate-[bounce_1s_infinite_400ms] rounded-full bg-amber-400" />
            </div>
          )}

          {/* Mute Microphone Button */}
          {isActive && (
            <button
              onClick={handleToggleMute}
              className={`ml-2 rounded-xl p-2 transition-colors ${
                isMuted ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              type="button"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* Voice Audio Speaker Output Toggle */}
          <button
            onClick={handleToggleTts}
            className={`rounded-xl p-2 transition-colors ${
              isAudioTtsEnabled ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title={isAudioTtsEnabled ? 'Voice Playback Active' : 'Voice Muted'}
            type="button"
          >
            {isAudioTtsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Error Badge */}
      {state === 'error' && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-slate-900/95 px-3 py-2 text-xs text-rose-300 shadow-xl backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage || 'Connection failed'}</span>
          <button
            onClick={handleToggleCall}
            className="ml-1 rounded-lg bg-rose-500/20 px-2 py-1 font-semibold text-rose-200 hover:bg-rose-500/30"
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Floating Voice Trigger Button */}
      <button
        onClick={handleToggleCall}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          isActive || isPlayingAudio
            ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30'
            : state === 'error'
            ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-500/30'
            : 'bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
        }`}
        title={isActive ? 'End Live Voice Call' : 'Start Gemini 2.0 Live Voice Call'}
        type="button"
      >
        {state === 'connecting' ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : isActive || isPlayingAudio ? (
          <PhoneOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6 transition-transform group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}

export default LiveAssistantWidget;
