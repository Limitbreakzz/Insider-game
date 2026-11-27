import { motion } from 'framer-motion';
import { KeyRound, RotateCcw, Shield, Skull, Trophy, User } from 'lucide-react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';

const ROLE_BADGE = {
  MASTER: { label: 'มาสเตอร์', className: 'bg-[var(--accent-master)] text-white' },
  INSIDER: { label: 'อินไซเดอร์', className: 'bg-[var(--accent-insider)] text-white' },
  COMMONER: { label: 'ชาวบ้าน', className: 'bg-[var(--accent-commoner)] text-white' },
};

const CONFETTI_PIECES = [
  { x: '-42%', y: -38, r: -28, color: '#D93829', delay: 0.05 },
  { x: '-28%', y: -52, r: 35, color: '#C98212', delay: 0.12 },
  { x: '-14%', y: -44, r: -18, color: '#266A78', delay: 0.08 },
  { x: '12%', y: -48, r: 22, color: '#D93829', delay: 0.15 },
  { x: '27%', y: -54, r: -40, color: '#EBA534', delay: 0.09 },
  { x: '41%', y: -36, r: 30, color: '#266A78', delay: 0.18 },
  { x: '-35%', y: -22, r: 15, color: '#EBA534', delay: 0.2 },
  { x: '34%', y: -24, r: -25, color: '#D93829', delay: 0.22 },
];

export function ResultPage() {
  const { gameState, playAgain } = useGameStore();
  if (!gameState || !gameState.result) return null;

  const { result, players, me } = gameState;
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const hasWinner = result.outcome !== 'ALL_LOSE';

  const bannerConfig =
    result.outcome === 'COMMONERS_WIN'
      ? {
          title: 'ชาวบ้านและมาสเตอร์ชนะ!',
          icon: Trophy,
          className:
            'border-emerald-500/40 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200',
        }
      : result.outcome === 'INSIDER_WIN'
        ? {
            title: 'อินไซเดอร์ชนะคนเดียว!',
            icon: KeyRound,
            className:
              'border-[var(--accent-insider)]/50 bg-[var(--accent-insider)]/12 text-[var(--accent-insider)]',
          }
        : {
            title: 'หมดเวลา — แพ้ทุกคน!',
            icon: Skull,
            className: 'border-amber-500/40 bg-amber-500/12 text-amber-800 dark:text-amber-200',
          };

  const BannerIcon = bannerConfig.icon;
  const guesserVoteEntries = Object.entries(result.guesserVotes);
  const suspectVoteEntries = Object.entries(result.suspectVotes);

  return (
    <div className="mx-auto flex max-w-[1060px] flex-col gap-5 px-5 py-5" data-testid="phase-result">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="สรุปผลรอบนี้" />

      {/* แบนเนอร์สรุปผล + Celebration Burst */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={`tabletop-card relative overflow-hidden rounded-2xl border-2 p-6 text-center ${bannerConfig.className}`}
      >
        {hasWinner && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {CONFETTI_PIECES.map((c, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, x: '0%', y: 30, scale: 0.4, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: c.x,
                  y: [20, c.y, c.y + 45],
                  scale: [0.4, 1.1, 0.9],
                  rotate: c.r * 3,
                }}
                transition={{ duration: 1.5, delay: c.delay, ease: 'easeOut' }}
                style={{ backgroundColor: c.color }}
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-xs"
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.5, rotate: -14 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.08 }}
          className="inline-flex"
        >
          <BannerIcon aria-hidden="true" className="mx-auto mb-2 h-11 w-11" />
        </motion.div>

        <h1 data-testid="result-outcome" className="font-display text-3xl font-bold tracking-tight">
          {bannerConfig.title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">{result.reason}</p>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.18 }}
          className="mt-5 inline-flex flex-col items-center rounded-xl bg-[var(--bg-card)] px-6 py-3 text-[var(--ink-primary)] shadow-xs"
        >
          <span className="text-xs font-semibold text-[var(--ink-secondary)]">คำลับประจำรอบนี้</span>
          <span
            data-testid="result-secret-word"
            className="font-display text-2xl font-bold text-[var(--accent-insider)]"
          >
            {result.secretWord}
          </span>
        </motion.div>
      </motion.div>

      {/* เฉลยบทบาททุกคน (Staggered Flip-In) */}
      <section className="tabletop-card rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-bold">เฉลยบทบาททุกคน</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((p, idx) => {
            const role = p.role ?? result.roles[p.id] ?? 'COMMONER';
            const badge = ROLE_BADGE[role];
            const isAccused = result.accusedPlayerId === p.id;
            const isGuesser = result.guesserId === p.id;
            const Icon = role === 'MASTER' ? Shield : role === 'INSIDER' ? KeyRound : User;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, delay: 0.15 + idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                data-testid={`result-role-${p.name}`}
                className={`flex items-center justify-between rounded-xl border bg-[var(--bg-table)] px-4 py-3 ${
                  role === 'INSIDER'
                    ? 'border-[var(--accent-insider)]/50'
                    : 'border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar
                    name={p.name}
                    avatar={p.avatar}
                    isBot={p.isBot}
                    isMaster={role === 'MASTER'}
                  />
                  <div>
                    <div className="font-semibold">
                      {p.name}
                      {p.id === me.id && (
                        <span className="ml-1.5 text-xs text-[var(--ink-secondary)]">(คุณ)</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--ink-secondary)]">
                      {isGuesser && <span>คนทายคำถูก</span>}
                      {isAccused && (
                        <span className="font-bold text-[var(--accent-insider)]">
                          ถูกโหวตกล่าวหา
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${badge.className}`}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {badge.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* สรุปผลโหวต */}
      {(guesserVoteEntries.length > 0 || suspectVoteEntries.length > 0) && (
        <section className="tabletop-card space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold">สรุปผลโหวต</h2>

          {guesserVoteEntries.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                ขั้นที่ 1 — สงสัยว่า {playerMap.get(result.guesserId ?? '')?.name ?? 'คนทายคำถูก'}{' '}
                คืออินไซเดอร์หรือไม่?
              </h3>
              <div className="flex flex-wrap gap-2">
                {guesserVoteEntries.map(([voterId, voteYes]) => (
                  <span
                    key={voterId}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      voteYes
                        ? 'bg-[var(--accent-insider)]/15 text-[var(--accent-insider)]'
                        : 'bg-[var(--bg-subtle)] text-[var(--ink-primary)]'
                    }`}
                  >
                    {playerMap.get(voterId)?.name ?? 'ผู้เล่น'}: {voteYes ? 'ใช่' : 'ไม่ใช่'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suspectVoteEntries.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                ขั้นที่ 2 — โหวตชี้ตัวผู้ต้องสงสัย
              </h3>
              <div className="flex flex-wrap gap-2">
                {suspectVoteEntries.map(([voterId, targetId]) => (
                  <span
                    key={voterId}
                    className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-table)] px-3 py-1.5 text-xs font-semibold"
                  >
                    {playerMap.get(voterId)?.name ?? 'ผู้เล่น'} →{' '}
                    <strong>{playerMap.get(targetId)?.name ?? 'ผู้เล่น'}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* เล่นรอบใหม่ */}
      <div className="flex justify-center">
        {me.isHost ? (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            data-testid="btn-play-again"
            onClick={() => void playAgain()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-insider)] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            เล่นรอบใหม่ (กลับไปห้องล็อบบี้)
          </motion.button>
        ) : (
          <p className="text-sm text-[var(--ink-secondary)]">รอหัวหน้าห้องกดเริ่มรอบถัดไป…</p>
        )}
      </div>
    </div>
  );
}
