import { Hourglass, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
function formatTime(sec) {
    const clamped = Math.max(0, Math.floor(sec));
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
export function TimerBar({ timer, label }) {
    const [displaySec, setDisplaySec] = useState(timer.remainingSec);
    useEffect(() => {
        const compute = () => {
            if (!timer.endsAt)
                return timer.remainingSec;
            return Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
        };
        setDisplaySec(compute());
        if (!timer.endsAt)
            return;
        const id = setInterval(() => {
            setDisplaySec(compute());
        }, 250);
        return () => clearInterval(id);
    }, [timer.endsAt, timer.remainingSec]);
    const pct = timer.durationSec > 0 ? Math.min(100, Math.max(0, (displaySec / timer.durationSec) * 100)) : 0;
    const isUrgent = displaySec > 0 && displaySec <= 20;
    return (<div className="tabletop-card rounded-2xl p-4" data-testid="timer-bar">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {timer.flippedFromElapsedSec ? (<RotateCcw aria-hidden="true" className="h-4 w-4 text-[var(--accent-master)]"/>) : (<Hourglass aria-hidden="true" className="h-4 w-4 text-[var(--accent-insider)]"/>)}
          <span className="text-xs font-bold text-[var(--ink-secondary)]">{label}</span>
          {timer.flippedFromElapsedSec !== undefined && (<span className="rounded-full bg-[var(--accent-master)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent-master)]">
              พลิกนาฬิกาทราย (ใช้เวลาทาย {timer.flippedFromElapsedSec} วิ)
            </span>)}
        </div>
        <span data-testid="timer-value" className={`font-mono-code text-xl font-bold tabular-nums ${isUrgent ? 'text-[var(--accent-insider)]' : ''}`}>
          {formatTime(displaySec)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div className={`h-full rounded-full transition-[width] duration-300 ${isUrgent ? 'bg-[var(--accent-insider)]' : 'bg-[var(--accent-commoner)]'}`} style={{ width: `${pct}%` }}/>
      </div>
    </div>);
}
