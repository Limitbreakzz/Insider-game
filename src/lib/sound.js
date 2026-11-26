const MUTE_KEY = 'insider_sound_muted_v1';
let audioCtx = null;
function getAudioContext() {
    if (typeof window === 'undefined')
        return null;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor)
        return null;
    if (!audioCtx) {
        audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') {
        void audioCtx.resume().catch(() => { });
    }
    return audioCtx;
}
export function isSoundMuted() {
    try {
        return localStorage.getItem(MUTE_KEY) === 'true';
    }
    catch {
        return false;
    }
}
export function setSoundMuted(muted) {
    try {
        localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
    }
    catch {
        // ignore storage errors
    }
}
function playTone(freq, durationSec, delaySec = 0, type = 'sine', volume = 0.06) {
    if (isSoundMuted())
        return;
    const ctx = getAudioContext();
    if (!ctx)
        return;
    try {
        const start = ctx.currentTime + delaySec;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + durationSec + 0.02);
    }
    catch {
        // ignore Web Audio autoplay restrictions
    }
}
export const sound = {
    click() {
        playTone(580, 0.045, 0, 'triangle', 0.045);
        playTone(860, 0.035, 0.012, 'sine', 0.025);
    },
    phaseChange() {
        playTone(523.25, 0.12, 0, 'triangle', 0.05);
        playTone(659.25, 0.16, 0.09, 'triangle', 0.05);
    },
    wordFound() {
        playTone(523.25, 0.12, 0, 'triangle', 0.07);
        playTone(659.25, 0.12, 0.09, 'triangle', 0.07);
        playTone(783.99, 0.24, 0.18, 'triangle', 0.08);
    },
    voteCast() {
        playTone(440, 0.09, 0, 'sine', 0.05);
    },
    resultWin() {
        playTone(523.25, 0.14, 0, 'triangle', 0.06);
        playTone(659.25, 0.14, 0.1, 'triangle', 0.06);
        playTone(783.99, 0.14, 0.2, 'triangle', 0.06);
        playTone(1046.5, 0.3, 0.3, 'triangle', 0.07);
    },
    resultLose() {
        playTone(392, 0.18, 0, 'sawtooth', 0.04);
        playTone(311.13, 0.28, 0.16, 'sawtooth', 0.04);
    },
};
