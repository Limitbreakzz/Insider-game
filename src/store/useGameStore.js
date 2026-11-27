import { create } from 'zustand';
import { socket } from '../lib/socket';
const SESSION_KEY = 'insider_session_v1';
const THEME_KEY = 'insider_theme_v1';
function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (parsed.roomCode && parsed.playerToken)
            return parsed;
        return null;
    }
    catch {
        return null;
    }
}
function saveSession(session) {
    try {
        if (!session) {
            sessionStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_KEY);
        }
        else {
            const json = JSON.stringify(session);
            sessionStorage.setItem(SESSION_KEY, json);
            localStorage.setItem(SESSION_KEY, json);
        }
    }
    catch {
        // ignore storage errors
    }
}
function loadInitialTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light')
            return saved;
    }
    catch {
        // ignore
    }
    return 'light';
}
function emitWithAck(event, payload) {
    return new Promise((resolve) => {
        if (payload === undefined) {
            socket.emit(event, (res) => resolve(res));
        }
        else {
            socket.emit(event, payload, (res) => resolve(res));
        }
    });
}
let socketInitialized = false;
export const useGameStore = create((set, get) => ({
    connected: false,
    reconnecting: false,
    savedSession: loadSession(),
    gameState: null,
    error: null,
    theme: loadInitialTheme(),
    rulesOpen: false,
    rejoinSavedSession: async () => {
        const saved = get().savedSession ?? loadSession();
        if (!saved)
            return false;
        set({ reconnecting: true, error: null });
        const res = await emitWithAck('room:reconnect', {
            roomCode: saved.roomCode,
            playerToken: saved.playerToken,
        });
        if (!res.ok) {
            saveSession(null);
            set({
                reconnecting: false,
                savedSession: null,
                gameState: null,
                error: res.error ?? 'ไม่สามารถกลับเข้าห้องเดิมได้',
            });
            return false;
        }
        set({ reconnecting: false });
        return true;
    },
    dismissSavedSession: () => {
        saveSession(null);
        set({ savedSession: null });
    },
    initSocket: () => {
        if (socketInitialized)
            return;
        socketInitialized = true;
        const attemptReconnect = async () => {
            const saved = loadSession();
            if (!saved)
                return;
            set({ reconnecting: true });
            const res = await emitWithAck('room:reconnect', {
                roomCode: saved.roomCode,
                playerToken: saved.playerToken,
            });
            if (!res.ok) {
                saveSession(null);
                set({ reconnecting: false, gameState: null });
            }
            else {
                set({ reconnecting: false });
            }
        };
        socket.on('connect', () => {
            set({ connected: true });
            void attemptReconnect();
        });
        socket.on('disconnect', () => {
            set({ connected: false });
        });
        socket.on('game:state', (state) => {
            set({ gameState: state });
        });
        socket.on('room:kicked', (payload) => {
            saveSession(null);
            set({ gameState: null, error: payload?.message ?? 'คุณถูกเชิญออกจากห้อง' });
        });
        if (socket.connected) {
            set({ connected: true });
            void attemptReconnect();
        }
    },
    setTheme: (theme) => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        }
        catch {
            // ignore
        }
        set({ theme });
    },
    toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(next);
    },
    setRulesOpen: (open) => set({ rulesOpen: open }),
    clearError: () => set({ error: null }),
    createRoom: async (playerName, options) => {
        set({ error: null });
        const res = await emitWithAck('room:create', {
            playerName,
            avatar: options?.avatar,
            config: options?.config,
            fillBots: options?.fillBots,
        });
        if (!res.ok || !res.data) {
            set({ error: res.error ?? 'สร้างห้องไม่สำเร็จ' });
            return false;
        }
        saveSession(res.data);
        set({ savedSession: res.data });
        return true;
    },
    joinRoom: async (roomCode, playerName, avatar) => {
        set({ error: null });
        const res = await emitWithAck('room:join', { roomCode, playerName, avatar });
        if (!res.ok || !res.data) {
            set({ error: res.error ?? 'เข้าห้องไม่สำเร็จ' });
            return false;
        }
        saveSession(res.data);
        set({ savedSession: res.data });
        return true;
    },
    addBot: async () => {
        set({ error: null });
        const res = await emitWithAck('bot:add');
        if (!res.ok) {
            set({ error: res.error ?? 'เพิ่มบอทไม่สำเร็จ' });
            return false;
        }
        return true;
    },
    kickPlayer: async (targetPlayerId) => {
        set({ error: null });
        const res = await emitWithAck('room:kick', { targetPlayerId });
        if (!res.ok) {
            set({ error: res.error ?? 'ลบผู้เล่นไม่สำเร็จ' });
            return false;
        }
        return true;
    },
    leaveRoom: async () => {
        await emitWithAck('room:leave');
        saveSession(null);
        set({ gameState: null, savedSession: null, error: null });
    },
    updateConfig: async (patch) => {
        set({ error: null });
        const res = await emitWithAck('room:updateConfig', patch);
        if (!res.ok) {
            set({ error: res.error ?? 'Could not update settings.' });
            return false;
        }
        return true;
    },
    setCustomWord: async (word) => {
        set({ error: null });
        const res = await emitWithAck('room:setCustomWord', { word });
        if (!res.ok) {
            set({ error: res.error ?? 'ไม่สามารถกำหนดคำลับรอบนี้ได้' });
            return false;
        }
        return true;
    },
    startGame: async () => {
        set({ error: null });
        const res = await emitWithAck('game:start');
        if (!res.ok) {
            set({ error: res.error ?? 'Could not start game.' });
            return false;
        }
        return true;
    },
    setReady: async (ready) => {
        set({ error: null });
        const res = await emitWithAck('game:ready', { ready });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not update ready status.' });
            return false;
        }
        return true;
    },
    askQuestion: async (text, kind) => {
        set({ error: null });
        const res = await emitWithAck('question:ask', { text, kind });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not submit.' });
            return false;
        }
        return true;
    },
    answerQuestion: async (questionId, answer) => {
        set({ error: null });
        const res = await emitWithAck('question:answer', { questionId, answer });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not submit answer.' });
            return false;
        }
        return true;
    },
    sendMessage: async (text) => {
        set({ error: null });
        const res = await emitWithAck('discussion:message', { text });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not send message.' });
            return false;
        }
        return true;
    },
    voteGuesser: async (voteYes) => {
        set({ error: null });
        const res = await emitWithAck('vote:guesser', { voteYes });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not submit vote.' });
            return false;
        }
        return true;
    },
    voteSuspect: async (targetPlayerId) => {
        set({ error: null });
        const res = await emitWithAck('vote:suspect', { targetPlayerId });
        if (!res.ok) {
            set({ error: res.error ?? 'Could not submit vote.' });
            return false;
        }
        return true;
    },
    advancePhase: async () => {
        set({ error: null });
        const res = await emitWithAck('game:advancePhase');
        if (!res.ok) {
            set({ error: res.error ?? 'ไม่สามารถข้ามเฟสได้' });
            return false;
        }
        return true;
    },
    markGuesser: async (guesserPlayerId) => {
        set({ error: null });
        const res = await emitWithAck('question:markGuesser', { guesserPlayerId });
        if (!res.ok) {
            set({ error: res.error ?? 'ไม่สามารถระบุคนทายถูกได้' });
            return false;
        }
        return true;
    },
    playAgain: async () => {
        set({ error: null });
        const res = await emitWithAck('game:playAgain');
        if (!res.ok) {
            set({ error: res.error ?? 'Could not return to lobby.' });
            return false;
        }
        return true;
    },
}));
