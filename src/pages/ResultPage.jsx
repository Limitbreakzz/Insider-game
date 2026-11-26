import { KeyRound, RotateCcw, Shield, Skull, Trophy, User } from 'lucide-react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';
const ROLE_BADGE = {
    MASTER: { label: 'มาสเตอร์', className: 'bg-[var(--accent-master)] text-white' },
    INSIDER: { label: 'อินไซเดอร์', className: 'bg-[var(--accent-insider)] text-white' },
    COMMONER: { label: 'ชาวบ้าน', className: 'bg-[var(--accent-commoner)] text-white' },
};
export function ResultPage() {
    const { gameState, playAgain } = useGameStore();
    if (!gameState || !gameState.result)
        return null;
    const { result, players, me } = gameState;
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const bannerConfig = result.outcome === 'COMMONERS_WIN'
        ? {
            title: 'ชาวบ้านและมาสเตอร์ชนะ!',
            icon: Trophy,
            className: 'border-emerald-500/40 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200',
        }
        : result.outcome === 'INSIDER_WIN'
            ? {
                title: 'อินไซเดอร์ชนะคนเดียว!',
                icon: KeyRound,
                className: 'border-[var(--accent-insider)]/50 bg-[var(--accent-insider)]/12 text-[var(--accent-insider)]',
            }
            : {
                title: 'หมดเวลา — แพ้ทุกคน!',
                icon: Skull,
                className: 'border-amber-500/40 bg-amber-500/12 text-amber-800 dark:text-amber-200',
            };
    const BannerIcon = bannerConfig.icon;
    const guesserVoteEntries = Object.entries(result.guesserVotes);
    const suspectVoteEntries = Object.entries(result.suspectVotes);
    return (<div className="mx-auto flex max-w-[1060px] flex-col gap-5 px-5 py-5" data-testid="phase-result">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="สรุปผลรอบนี้"/>
      {/* แบนเนอร์สรุปผล */}
      <div className={`tabletop-card animate-card-pop rounded-2xl border-2 p-6 text-center ${bannerConfig.className}`}>
        <BannerIcon aria-hidden="true" className="mx-auto mb-2 h-10 w-10"/>
        <h1 data-testid="result-outcome" className="font-display text-3xl font-bold tracking-tight">
          {bannerConfig.title}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">{result.reason}</p>

        <div className="mt-5 inline-flex flex-col items-center rounded-xl bg-[var(--bg-card)] px-6 py-3 text-[var(--ink-primary)] shadow-xs">
          <span className="text-xs font-semibold text-[var(--ink-secondary)]">คำลับประจำรอบนี้</span>
          <span data-testid="result-secret-word" className="font-display text-2xl font-bold text-[var(--accent-insider)]">
            {result.secretWord}
          </span>
        </div>
      </div>

      {/* เฉลยบทบาททุกคน */}
      <section className="tabletop-card rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg font-bold">เฉลยบทบาททุกคน</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {players.map((p) => {
            const role = p.role ?? result.roles[p.id] ?? 'COMMONER';
            const badge = ROLE_BADGE[role];
            const isAccused = result.accusedPlayerId === p.id;
            const isGuesser = result.guesserId === p.id;
            const Icon = role === 'MASTER' ? Shield : role === 'INSIDER' ? KeyRound : User;
            return (<div key={p.id} data-testid={`result-role-${p.name}`} className="flex items-center justify-between rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={p.name} avatar={p.avatar} isBot={p.isBot} isMaster={role === 'MASTER'}/>
                  <div>
                    <div className="font-semibold">
                      {p.name}
                      {p.id === me.id && (<span className="ml-1.5 text-xs text-[var(--ink-secondary)]">(คุณ)</span>)}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--ink-secondary)]">
                      {isGuesser && <span>คนทายคำถูก</span>}
                      {isAccused && (<span className="font-bold text-[var(--accent-insider)]">ถูกโหวตกล่าวหา</span>)}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${badge.className}`}>
                  <Icon aria-hidden="true" className="h-3.5 w-3.5"/>
                  {badge.label}
                </span>
              </div>);
        })}
        </div>
      </section>

      {/* สรุปผลโหวต */}
      {(guesserVoteEntries.length > 0 || suspectVoteEntries.length > 0) && (<section className="tabletop-card space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold">สรุปผลโหวต</h2>

          {guesserVoteEntries.length > 0 && (<div>
              <h3 className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                ขั้นที่ 1 — สงสัยว่า {playerMap.get(result.guesserId ?? '')?.name ?? 'คนทายคำถูก'}{' '}
                คืออินไซเดอร์หรือไม่?
              </h3>
              <div className="flex flex-wrap gap-2">
                {guesserVoteEntries.map(([voterId, voteYes]) => (<span key={voterId} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${voteYes
                        ? 'bg-[var(--accent-insider)]/15 text-[var(--accent-insider)]'
                        : 'bg-[var(--bg-subtle)] text-[var(--ink-primary)]'}`}>
                    {playerMap.get(voterId)?.name ?? 'ผู้เล่น'}: {voteYes ? 'ใช่' : 'ไม่ใช่'}
                  </span>))}
              </div>
            </div>)}

          {suspectVoteEntries.length > 0 && (<div>
              <h3 className="mb-2 text-xs font-bold text-[var(--ink-secondary)]">
                ขั้นที่ 2 — โหวตชี้ตัวผู้ต้องสงสัย
              </h3>
              <div className="flex flex-wrap gap-2">
                {suspectVoteEntries.map(([voterId, targetId]) => (<span key={voterId} className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-table)] px-3 py-1.5 text-xs font-semibold">
                    {playerMap.get(voterId)?.name ?? 'ผู้เล่น'} →{' '}
                    <strong>{playerMap.get(targetId)?.name ?? 'ผู้เล่น'}</strong>
                  </span>))}
              </div>
            </div>)}
        </section>)}

      {/* เล่นรอบใหม่ */}
      <div className="flex justify-center">
        {me.isHost ? (<button type="button" data-testid="btn-play-again" onClick={() => void playAgain()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-insider)] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95">
            <RotateCcw aria-hidden="true" className="h-4 w-4"/>
            เล่นรอบใหม่ (กลับไปห้องล็อบบี้)
          </button>) : (<p className="text-sm text-[var(--ink-secondary)]">
            รอหัวหน้าห้องกดเริ่มรอบถัดไป…
          </p>)}
      </div>
    </div>);
}
