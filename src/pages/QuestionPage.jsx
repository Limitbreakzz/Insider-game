import { motion } from 'framer-motion';
import { Check, HelpCircle, MessageSquarePlus, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PlayerList } from '../components/PlayerList';
import { RoleCard } from '../components/RoleCard';
import { TimerBar } from '../components/TimerBar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';
const ANSWER_STYLES = {
    YES: {
        label: 'ใช่',
        className: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
    },
    NO: {
        label: 'ไม่ใช่',
        className: 'bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-300',
    },
    MAYBE: {
        label: 'อาจจะ',
        className: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:text-indigo-300',
    },
    UNKNOWN: {
        label: 'ไม่รู้',
        className: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
    },
    CORRECT: {
        label: 'ถูกต้อง!',
        className: 'bg-[var(--accent-master)] text-white border-transparent',
    },
};
const QUICK_QUESTIONS = [
    'เป็นสิ่งมีชีวิตไหม?',
    'กินได้ไหม?',
    'พบได้ในบ้านไหม?',
    'ใหญ่กว่าคนไหม?',
    'ใช้ในชีวิตประจำวันไหม?',
    'ทำจากธรรมชาติไหม?',
];
export function QuestionPage() {
    const { gameState, askQuestion, answerQuestion, markGuesser, error } = useGameStore();
    const [questionText, setQuestionText] = useState('');
    const [guessText, setGuessText] = useState('');
    const feedEndRef = useRef(null);
    useEffect(() => {
        feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [gameState?.questions.length]);
    if (!gameState || !gameState.me.role)
        return null;
    const { me, players, questions, timer, config } = gameState;
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const myRole = gameState.me.role;
    const isMaster = myRole === 'MASTER';
    const isManualMaster = config.controlMode === 'MANUAL_HOST' && me.isHost && isMaster;
    const guessCandidates = players.filter((p) => !p.isMaster);
    const handleAsk = async (e) => {
        e.preventDefault();
        if (!questionText.trim())
            return;
        const ok = await askQuestion(questionText.trim(), 'QUESTION');
        if (ok)
            setQuestionText('');
    };
    const handleGuess = async (e) => {
        e.preventDefault();
        if (!guessText.trim())
            return;
        const ok = await askQuestion(guessText.trim(), 'GUESS');
        if (ok)
            setGuessText('');
    };
    return (<div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-4" data-testid="phase-question">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="เฟส 1: ถาม-ตอบ"/>
      <TimerBar timer={timer} label="เฟส 1: ถาม-ตอบและทายคำลับให้ทันเวลา!"/>

      {error && (<div role="alert" aria-live="polite" data-testid="error-banner" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>)}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ฝั่งซ้าย: รายการคำถาม-คำตอบ */}
        <div className="space-y-4">
          <div className="tabletop-card flex flex-col rounded-2xl p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">
                คำถามและการทายคำ ({questions.length})
              </h2>
              <span className="text-xs text-[var(--ink-secondary)]">
                {isMaster
            ? 'กดตอบคำถามของเพื่อนด้านล่าง'
            : 'ถามคำถามใช่/ไม่ใช่ หรือพิมพ์ทายคำลับได้เลย'}
              </span>
            </div>

            <div data-testid="question-feed" className="max-h-[400px] min-h-[220px] space-y-2.5 overflow-y-auto pr-1">
              {questions.length === 0 ? (<div className="flex h-48 flex-col items-center justify-center text-center text-sm text-[var(--ink-secondary)]">
                  <MessageSquarePlus aria-hidden="true" className="mb-2 h-6 w-6 opacity-50"/>
                  ยังไม่มีคำถาม เริ่มถามมาสเตอร์ได้เลย!
                </div>) : (questions.map((q) => (<motion.div key={q.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} data-testid={`question-item-${q.id}`} className={`rounded-xl border p-3.5 ${q.kind === 'GUESS'
                ? 'border-[var(--accent-master)]/40 bg-[var(--accent-master)]/6'
                : 'border-[var(--border-card)] bg-[var(--bg-table)]/70'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <PlayerAvatar name={q.playerName} avatar={playerMap.get(q.playerId)?.avatar} isBot={playerMap.get(q.playerId)?.isBot} size="sm"/>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{q.playerName}</span>
                            {q.kind === 'GUESS' && (<span className="rounded bg-[var(--accent-master)]/20 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-master)]">
                                ทายคำลับ
                              </span>)}
                          </div>
                          <p className="mt-0.5 text-sm font-medium">{q.text}</p>
                        </div>
                      </div>

                      {q.answer ? (<span data-testid={`answer-badge-${q.answer}`} className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${ANSWER_STYLES[q.answer].className}`}>
                          {ANSWER_STYLES[q.answer].label}
                        </span>) : isMaster ? (<div className="flex flex-wrap items-center gap-1.5">
                          <button type="button" data-testid="btn-answer-yes" onClick={() => void answerQuestion(q.id, 'YES')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-emerald-700">
                            <Check aria-hidden="true" className="h-3.5 w-3.5"/>
                            ใช่
                          </button>
                          <button type="button" data-testid="btn-answer-no" onClick={() => void answerQuestion(q.id, 'NO')} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-red-700">
                            <X aria-hidden="true" className="h-3.5 w-3.5"/>
                            ไม่ใช่
                          </button>
                          <button type="button" data-testid="btn-answer-maybe" onClick={() => void answerQuestion(q.id, 'MAYBE')} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-indigo-700">
                            อาจจะ
                          </button>
                          <button type="button" data-testid="btn-answer-unknown" onClick={() => void answerQuestion(q.id, 'UNKNOWN')} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-2.5 py-1 text-xs font-bold transition-colors hover:bg-[var(--bg-subtle)]">
                            <HelpCircle aria-hidden="true" className="h-3.5 w-3.5"/>
                            ไม่รู้
                          </button>
                          <button type="button" data-testid="btn-answer-correct" onClick={() => void answerQuestion(q.id, 'CORRECT')} className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent-master)] px-2.5 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90">
                            <Sparkles aria-hidden="true" className="h-3.5 w-3.5"/>
                            ถูกต้อง!
                          </button>
                        </div>) : (<span className="rounded-lg bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--ink-secondary)]">
                          รอมาสเตอร์ตอบ…
                        </span>)}
                    </div>
                  </motion.div>)))}
              <div ref={feedEndRef}/>
            </div>

            {isManualMaster && (
              <div className="mt-4 space-y-2.5 border-t border-[var(--border-card)] pt-4">
                <div className="text-xs font-bold text-[var(--accent-master)]">
                  โหมดหัวหน้าห้องคุมเกม — มีคนพูดทายคำถูกในวงจริงแล้ว? กดเลือกคนทายถูกได้เลย:
                </div>
                <div className="flex flex-wrap gap-2">
                  {guessCandidates.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      data-testid={`btn-mark-guesser-${p.name}`}
                      onClick={() => void markGuesser(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent-master)]/45 bg-[var(--accent-master)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent-master)] transition-colors hover:bg-[var(--accent-master)] hover:text-white"
                    >
                      <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                      {p.name} ทายถูก!
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isMaster && (<div className="mt-4 space-y-3 border-t border-[var(--border-card)] pt-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[var(--ink-secondary)]">
                    คำถามด่วน:
                  </span>
                  {QUICK_QUESTIONS.map((q) => (<button key={q} type="button" onClick={() => void askQuestion(q, 'QUESTION')} className="rounded-full border border-[var(--border-card)] bg-[var(--bg-table)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-primary)] transition-colors hover:border-[var(--accent-commoner)] hover:bg-[var(--accent-commoner)]/10">
                      {q}
                    </button>))}
                </div>

                <form onSubmit={handleAsk} className="flex gap-2">
                  <input type="text" name="question" aria-label="พิมพ์คำถามใช่หรือไม่ใช่" autoComplete="off" maxLength={200} data-testid="input-question" placeholder="ถามคำถามใช่/ไม่ใช่ (เช่น เป็นสิ่งมีชีวิตไหม?)…" value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="flex-1 rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--accent-commoner)]"/>
                  <button type="submit" data-testid="btn-ask-question" disabled={!questionText.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-commoner)] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-45">
                    <Send aria-hidden="true" className="h-4 w-4"/>
                    ถาม
                  </button>
                </form>

                <form onSubmit={handleGuess} className="flex gap-2">
                  <input type="text" name="guess" aria-label="พิมพ์ทายคำลับ" autoComplete="off" maxLength={100} data-testid="input-guess-word" placeholder="รู้คำตอบแล้ว? พิมพ์ทายคำลับตรงนี้…" value={guessText} onChange={(e) => setGuessText(e.target.value)} className="flex-1 rounded-xl border border-[var(--accent-master)]/50 bg-[var(--bg-table)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[var(--accent-master)]"/>
                  <button type="submit" data-testid="btn-submit-guess" disabled={!guessText.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-master)] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-45">
                    <Sparkles aria-hidden="true" className="h-4 w-4"/>
                    ทายคำ
                  </button>
                </form>
              </div>)}
          </div>
        </div>

        {/* ฝั่งขวา: การ์ดบทบาทและรายชื่อ */}
        <div className="space-y-4">
          <RoleCard role={myRole} secretWord={me.secretWord} knownInsiderName={me.knownInsiderName}/>
          <div className="tabletop-card rounded-2xl p-4">
            <h3 className="mb-3 font-display text-sm font-bold text-[var(--ink-secondary)]">
              ผู้เล่นในวง
            </h3>
            <PlayerList players={players} myId={me.id}/>
          </div>
        </div>
      </div>
    </div>);
}
