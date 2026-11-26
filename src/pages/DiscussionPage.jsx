import { CheckCircle2, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PlayerList } from '../components/PlayerList';
import { TimerBar } from '../components/TimerBar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';
const ANSWER_TH = {
    YES: 'ใช่',
    NO: 'ไม่ใช่',
    UNKNOWN: 'ไม่รู้',
    CORRECT: 'ถูกต้อง!',
};
export function DiscussionPage() {
    const { gameState, sendMessage, setReady } = useGameStore();
    const [text, setText] = useState('');
    const chatEndRef = useRef(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [gameState?.messages.length]);
    if (!gameState)
        return null;
    const { me, players, messages, questions, guesserId, timer } = gameState;
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const guesser = players.find((p) => p.id === guesserId);
    const myPlayer = players.find((p) => p.id === me.id);
    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim())
            return;
        const ok = await sendMessage(text.trim());
        if (ok)
            setText('');
    };
    return (<div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-4" data-testid="phase-discussion">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="เฟส 2: ถกเถียง"/>
      <TimerBar timer={timer} label="เฟส 2: ถกเถียงจับผิด — ใครคืออินไซเดอร์?"/>

      {guesser && (<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5 text-sm">
            <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"/>
            <span>
              <strong>{guesser.name}</strong> เป็นคนทายคำลับถูก! ย้อนดูประวัติคำถามแล้วจับพิรุธกันเลย
            </span>
          </div>
          <button type="button" data-testid="btn-ready-vote" onClick={() => void setReady(!myPlayer?.isReady)} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${myPlayer?.isReady
                ? 'border border-emerald-600/40 bg-emerald-600 text-white'
                : 'bg-[var(--accent-insider)] text-white hover:opacity-95'}`}>
            <CheckCircle2 aria-hidden="true" className="h-4 w-4"/>
            {myPlayer?.isReady ? 'พร้อมโหวตแล้ว ✓' : 'พร้อมโหวต'}
          </button>
        </div>)}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* แชตถกเถียง */}
        <section className="tabletop-card flex flex-col rounded-2xl p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <MessageCircle aria-hidden="true" className="h-5 w-5 text-[var(--accent-insider)]"/>
            ห้องถกเถียง
          </h2>

          <div data-testid="discussion-feed" className="max-h-[340px] min-h-[220px] flex-1 space-y-2.5 overflow-y-auto pr-1">
            {messages.length === 0 ? (<p className="py-12 text-center text-sm text-[var(--ink-secondary)]">
                ใครถามคำถามแม่นผิดปกติเหมือนรู้คำตอบอยู่แล้ว? เริ่มคุยกันเลย!
              </p>) : (messages.map((m) => {
            const sender = playerMap.get(m.playerId);
            return (<div key={m.id} className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-sm ${m.playerId === me.id
                    ? 'ml-6 bg-[var(--accent-commoner)]/12'
                    : 'mr-6 bg-[var(--bg-table)]'}`}>
                    <PlayerAvatar name={m.playerName} avatar={sender?.avatar} isBot={sender?.isBot} isMaster={sender?.isMaster} size="sm"/>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--ink-secondary)]">
                        {m.playerName}
                      </div>
                      <p className="mt-0.5 break-words">{m.text}</p>
                    </div>
                  </div>);
        }))}
            <div ref={chatEndRef}/>
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t border-[var(--border-card)] pt-3">
            <input type="text" name="discussionMessage" aria-label="พิมพ์ข้อความถกเถียง" autoComplete="off" maxLength={300} data-testid="input-discussion-msg" placeholder="พิมพ์ข้อสงสัยของคุณ…" value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-3.5 py-2.5 text-sm transition-colors focus:border-[var(--accent-insider)]"/>
            <button type="submit" data-testid="btn-send-discussion" disabled={!text.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-insider)] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-45">
              <Send aria-hidden="true" className="h-4 w-4"/>
              ส่ง
            </button>
          </form>
        </section>

        {/* รายชื่อผู้เล่น + ประวัติคำถาม */}
        <div className="space-y-4">
          <div className="tabletop-card rounded-2xl p-4">
            <h3 className="mb-3 font-display text-sm font-bold text-[var(--ink-secondary)]">
              ผู้เล่น
            </h3>
            <PlayerList players={players} myId={me.id} guesserId={guesserId} showReady/>
          </div>

          <div className="tabletop-card rounded-2xl p-4">
            <h3 className="mb-2 font-display text-sm font-bold text-[var(--ink-secondary)]">
              ประวัติคำถาม-คำตอบ ({questions.length})
            </h3>
            <div className="max-h-56 space-y-1.5 overflow-y-auto text-xs">
              {questions.map((q) => (<div key={q.id} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--bg-table)] px-2.5 py-1.5">
                  <span className="truncate">
                    <strong>{q.playerName}:</strong> {q.text}
                  </span>
                  {q.answer && (<span className="shrink-0 font-bold text-[var(--ink-secondary)]">
                      {ANSWER_TH[q.answer] ?? q.answer}
                    </span>)}
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
