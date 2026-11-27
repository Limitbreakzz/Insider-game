import { AnimatePresence, motion } from 'framer-motion';
import { Bot, CheckCircle2, Crown, Eye, Shield, UserCheck, UserX, WifiOff } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
export function PlayerList({ players, myId, guesserId, votedPlayerIds = [], showReady = false, canKick = false, onKick, }) {
    return (<ul className="space-y-2" data-testid="player-list">
      <AnimatePresence initial={false}>
      {players.map((p, index) => {
            const isMe = p.id === myId;
            const isGuesser = guesserId === p.id;
            const hasVoted = votedPlayerIds.includes(p.id);
            const seatNum = `#${String(index + 1).padStart(2, '0')}`;
            return (<motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              data-testid={`player-item-${p.name}`}
              className={`flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors ${isMe
                    ? 'border-[var(--accent-master)]/50 bg-[var(--accent-master)]/8'
                    : 'border-[var(--border-card)] bg-[var(--bg-table)]'} ${!p.isConnected ? 'opacity-60' : ''}`}
            >
            <div className="flex min-w-0 items-center gap-3">
              <PlayerAvatar name={p.name} avatar={p.avatar} isBot={p.isBot} isMaster={p.isMaster}/>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-code shrink-0 text-xs font-semibold text-[var(--ink-secondary)]">
                    {seatNum}
                  </span>
                  <span className="truncate text-sm font-bold text-[var(--ink-primary)]">{p.name}</span>
                  {isMe && (<span className="shrink-0 rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--ink-secondary)]">
                      คุณ
                    </span>)}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {p.isHost && (<span title="หัวหน้าห้อง" className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <Crown aria-hidden="true" className="h-3 w-3"/>
                      หัวหน้าห้อง
                    </span>)}
                  {p.isBot && (<span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-commoner)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-commoner)]">
                      <Bot aria-hidden="true" className="h-3 w-3"/>
                      บอท
                    </span>)}
                  {showReady && p.isReady && (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 aria-hidden="true" className="h-3 w-3"/>
                      พร้อม
                    </span>)}
                  {p.isMaster && (<span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-master)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-master)]">
                      <Shield aria-hidden="true" className="h-3 w-3"/>
                      มาสเตอร์
                    </span>)}
                  {isGuesser && (<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      <UserCheck aria-hidden="true" className="h-3 w-3"/>
                      คนทายคำถูก
                    </span>)}
                  {!p.isConnected && (<span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <WifiOff aria-hidden="true" className="h-3 w-3"/>
                      หลุดการเชื่อมต่อ
                    </span>)}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {hasVoted && (<span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-commoner)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-commoner)]">
                  <Eye aria-hidden="true" className="h-3.5 w-3.5"/>
                  โหวตแล้ว
                </span>)}
              {canKick && !isMe && onKick && (<button type="button" title={`ลบ ${p.name} ออกจากห้อง`} aria-label={`ลบ ${p.name} ออกจากห้อง`} onClick={() => onKick(p.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ink-secondary)] transition-colors hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400">
                  <UserX aria-hidden="true" className="h-3.5 w-3.5"/>
                </button>)}
            </div>
          </motion.li>);
        })}
      </AnimatePresence>
    </ul>);
}
