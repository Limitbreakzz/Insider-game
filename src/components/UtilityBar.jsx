import { BookOpen, LogOut, Moon, Sun, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { isSoundMuted, setSoundMuted } from '../lib/sound';
import { useGameStore } from '../store/useGameStore';
export function UtilityBar({ showLeave = false, rulesLabel = 'กติกา' }) {
    const { theme, toggleTheme, setRulesOpen, leaveRoom } = useGameStore();
    const [muted, setMuted] = useState(isSoundMuted);
    const handleToggleMute = () => {
        const next = !muted;
        setMuted(next);
        setSoundMuted(next);
    };
    return (<div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={() => setRulesOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-3 text-xs font-semibold transition-colors hover:bg-[var(--bg-subtle)]">
        <BookOpen aria-hidden="true" className="h-3.5 w-3.5"/>
        <span>{rulesLabel}</span>
      </button>

      <button type="button" onClick={handleToggleMute} aria-label={muted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'} title={muted ? 'เปิดเสียง' : 'ปิดเสียง'} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
        {muted ? (<VolumeX aria-hidden="true" className="h-4 w-4 text-[var(--ink-secondary)]"/>) : (<Volume2 aria-hidden="true" className="h-4 w-4"/>)}
      </button>

      <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'สลับเป็นโหมดมืด' : 'สลับเป็นโหมดสว่าง'} title={theme === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] transition-colors hover:bg-[var(--bg-subtle)]">
        {theme === 'light' ? (<Moon aria-hidden="true" className="h-4 w-4"/>) : (<Sun aria-hidden="true" className="h-4 w-4"/>)}
      </button>

      {showLeave && (<button type="button" onClick={() => void leaveRoom()} data-testid="leave-room-btn" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/20 dark:text-red-300">
          <LogOut aria-hidden="true" className="h-3.5 w-3.5"/>
          <span className="hidden sm:inline">ออกห้อง</span>
        </button>)}
    </div>);
}
export function GameTopBar({ roomCode, phaseLabel }) {
    const { connected } = useGameStore();
    return (<header className="tabletop-card flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-insider)] font-display text-sm font-bold text-white">
          IN
        </div>
        <span translate="no" className="font-display text-base font-bold tracking-tight">
          INSIDER
        </span>
        <span translate="no" data-testid="header-room-code" className="font-mono-code rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-xs font-bold tracking-wider">
          {roomCode}
        </span>
        <span className="hidden rounded-full bg-[var(--accent-insider)]/12 px-2.5 py-0.5 text-xs font-bold text-[var(--accent-insider)] sm:inline-block">
          {phaseLabel}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-secondary)]">
          {connected ? (<Wifi aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"/>) : (<WifiOff aria-hidden="true" className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"/>)}
        </span>
      </div>
      <UtilityBar showLeave/>
    </header>);
}
