import { CheckCircle2, Shield } from 'lucide-react';
import { PlayerList } from '../components/PlayerList';
import { RoleCard } from '../components/RoleCard';
import { TimerBar } from '../components/TimerBar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';
export function RoleRevealPage() {
    const { gameState, setReady } = useGameStore();
    if (!gameState || !gameState.me.role)
        return null;
    const { me, players, timer } = gameState;
    const myRole = gameState.me.role;
    const myPlayer = players.find((p) => p.id === me.id);
    const masterPlayer = players.find((p) => p.isMaster);
    return (<div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 py-5" data-testid="phase-role-reveal">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="ดูบทบาทลับ"/>
      <TimerBar timer={timer} label="ดูบทบาทลับของคุณ — กดยืนยันเมื่อพร้อม"/>

      {masterPlayer && (<div className="flex items-center gap-2.5 rounded-xl border border-[var(--accent-master)]/40 bg-[var(--accent-master)]/10 px-4 py-3 text-sm">
          <Shield aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-master)]"/>
          <span>
            รอบที่ {gameState.roundNumber}: <strong>{masterPlayer.name}</strong> คือ{' '}
            <strong>มาสเตอร์ (Master)</strong>
          </span>
        </div>)}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <RoleCard role={myRole} secretWord={me.secretWord}/>

          <button type="button" data-testid="btn-confirm-role" onClick={() => void setReady(!myPlayer?.isReady)} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${myPlayer?.isReady
            ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'bg-[var(--accent-insider)] text-white hover:opacity-95'}`}>
            <CheckCircle2 aria-hidden="true" className="h-4 w-4"/>
            {myPlayer?.isReady ? 'ยืนยันแล้ว — รอเพื่อนคนอื่น…' : 'ดูบทบาทแล้ว — พร้อมเริ่มเกม!'}
          </button>
        </div>

        <div className="tabletop-card rounded-2xl p-5">
          <h2 className="mb-3 font-display text-base font-bold">สถานะความพร้อม</h2>
          <PlayerList players={players} myId={me.id} showReady/>
        </div>
      </div>
    </div>);
}
