import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { RulesModal } from './components/RulesModal';
import { speakThai, vibrateDevice } from './lib/feedback';
import { sound } from './lib/sound';
import { DiscussionPage } from './pages/DiscussionPage';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { QuestionPage } from './pages/QuestionPage';
import { ResultPage } from './pages/ResultPage';
import { RoleRevealPage } from './pages/RoleRevealPage';
import { VotingPage } from './pages/VotingPage';
import { useGameStore } from './store/useGameStore';
export default function App() {
    const { gameState, theme, initSocket } = useGameStore();
    const prevPhaseRef = useRef(null);
    useEffect(() => {
        initSocket();
    }, [initSocket]);
    useEffect(() => {
        const handleButtonClick = (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const btn = target.closest('button:not(:disabled), [role="button"]');
            if (btn) {
                sound.click();
            }
        };
        document.addEventListener('click', handleButtonClick, { capture: true });
        return () => document.removeEventListener('click', handleButtonClick, { capture: true });
    }, []);
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = theme === 'dark' ? '#121316' : '#f5f1e8';
    }, [theme]);
    useEffect(() => {
        const phase = gameState?.phase ?? null;
        const prev = prevPhaseRef.current;
        prevPhaseRef.current = phase;
        if (!phase || !prev || phase === prev)
            return;
        const shouldNarrate = gameState?.config?.controlMode === 'NARRATOR' && gameState?.me?.isHost;
        if (phase === 'ROLE_REVEAL') {
            sound.phaseChange();
            vibrateDevice([90, 50, 90]);
            if (shouldNarrate)
                speakThai('เริ่มเกมแล้ว กรุณาเปิดดูบทบาทลับของคุณอย่างระมัดระวัง');
        }
        else if (phase === 'QUESTION') {
            sound.phaseChange();
            vibrateDevice(100);
            if (shouldNarrate)
                speakThai('เข้าสู่ช่วงถามตอบ เริ่มจับเวลาทายคำลับได้เลย');
        }
        else if (phase === 'DISCUSSION') {
            sound.wordFound();
            vibrateDevice([150, 70, 150]);
            if (shouldNarrate)
                speakThai('มีคนทายคำลับถูกแล้ว พลิกนาฬิกาทราย เริ่มถกเถียงจับผิดอินไซเดอร์');
        }
        else if (phase === 'VOTING') {
            sound.phaseChange();
            vibrateDevice([120, 60, 120]);
            if (shouldNarrate)
                speakThai('หมดเวลาถกเถียง เข้าสู่ช่วงโหวตจับตัวอินไซเดอร์');
        }
        else if (phase === 'RESULT') {
            vibrateDevice([200, 80, 200]);
            if (gameState?.result?.outcome === 'ALL_LOSE') {
                sound.resultLose();
                if (shouldNarrate)
                    speakThai('หมดเวลา ทุกคนแพ้ในรอบนี้');
            }
            else if (gameState?.result?.outcome === 'COMMONERS_WIN') {
                sound.resultWin();
                if (shouldNarrate)
                    speakThai('จับตัวอินไซเดอร์ได้แล้ว ชาวบ้านและมาสเตอร์เป็นฝ่ายชนะ');
            }
            else {
                sound.resultWin();
                if (shouldNarrate)
                    speakThai('จับผิดคน อินไซเดอร์เป็นฝ่ายชนะคนเดียว');
            }
        }
        else {
            sound.phaseChange();
        }
    }, [gameState?.phase, gameState?.result?.outcome, gameState?.config?.controlMode, gameState?.me?.isHost]);
    const renderPhase = () => {
        if (!gameState)
            return <HomePage />;
        switch (gameState.phase) {
            case 'LOBBY':
                return <LobbyPage />;
            case 'ROLE_REVEAL':
                return <RoleRevealPage />;
            case 'QUESTION':
                return <QuestionPage />;
            case 'DISCUSSION':
                return <DiscussionPage />;
            case 'VOTING':
                return <VotingPage />;
            case 'RESULT':
                return <ResultPage />;
            default:
                return <HomePage />;
        }
    };
    const phaseKey = gameState ? gameState.phase : 'HOME';
    return (<MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[var(--accent-insider)] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-white">
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <main id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderPhase()}
            </motion.div>
          </AnimatePresence>
        </main>
        <RulesModal />
      </div>
    </MotionConfig>);
}
