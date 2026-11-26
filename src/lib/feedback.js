import { isSoundMuted } from './sound';
const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').trim().replace(/\/+$/, '');
let currentAudio = null;
export function vibrateDevice(pattern = [120, 60, 120]) {
    try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            navigator.vibrate(pattern);
        }
    }
    catch {
        // ignore unsupported browsers
    }
}
function speakViaServerAudio(text) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        const ttsUrl = `${SERVER_URL}/api/tts?text=${encodeURIComponent(text)}`;
        const audio = new Audio(ttsUrl);
        currentAudio = audio;
        audio.onended = () => {
            if (currentAudio === audio)
                currentAudio = null;
        };
        audio.onerror = () => {
            if (currentAudio === audio)
                currentAudio = null;
        };
        void audio.play().catch(() => { });
    }
    catch {
        // ignore autoplay restriction
    }
}
export function speakThai(text) {
    try {
        if (isSoundMuted() || typeof window === 'undefined')
            return;
        if ('speechSynthesis' in window) {
            const synth = window.speechSynthesis;
            const voices = synth.getVoices() || [];
            const thVoice = voices.find((v) => v.lang?.toLowerCase() === 'th-th') ||
                voices.find((v) => v.lang?.toLowerCase().startsWith('th'));
            if (thVoice) {
                synth.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'th-TH';
                utter.voice = thVoice;
                utter.rate = 0.96;
                utter.pitch = 1.0;
                utter.volume = 0.95;
                utter.onerror = () => speakViaServerAudio(text);
                synth.speak(utter);
                return;
            }
        }
        // Fallback for browsers without a local Thai voice (e.g. Windows Chrome)
        speakViaServerAudio(text);
    }
    catch {
        // ignore speech errors
    }
}
