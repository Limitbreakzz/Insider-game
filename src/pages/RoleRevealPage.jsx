import { CheckCircle2, Eye, EyeOff, FastForward, KeyRound, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { PlayerList } from '../components/PlayerList';
import { TimerBar } from '../components/TimerBar';
import { GameTopBar } from '../components/UtilityBar';
import { useGameStore } from '../store/useGameStore';

const ROLE_META = {
  MASTER: {
    nameTh: 'มาสเตอร์',
    nameEn: 'Master',
    teamLabel: 'ฝ่ายชาวบ้านและมาสเตอร์',
    teamClass: 'bg-[var(--accent-master)]/15 text-[var(--accent-master)] border-[var(--accent-master)]/35',
    accentColor: 'text-[var(--accent-master)]',
    emblemClass: 'bg-[var(--accent-master)]/15 text-[var(--accent-master)] border-[var(--accent-master)]/35',
    desc: 'คุณคือผู้คุมคำลับประจำรอบ ตอบคำถามเพื่อนด้วย “ใช่”, “ไม่ใช่” หรือ “ไม่รู้” ห้ามหลุดบอกคำลับตรงๆ และช่วยจับอินไซเดอร์หลังทายถูก!',
    Icon: Shield,
  },
  INSIDER: {
    nameTh: 'อินไซเดอร์',
    nameEn: 'Insider',
    teamLabel: 'ฝ่ายอินไซเดอร์ (ชนะคนเดียว)',
    teamClass: 'bg-[var(--accent-insider)]/15 text-[var(--accent-insider)] border-[var(--accent-insider)]/35',
    accentColor: 'text-[var(--accent-insider)]',
    emblemClass: 'bg-[var(--accent-insider)]/15 text-[var(--accent-insider)] border-[var(--accent-insider)]/35',
    desc: 'คุณแอบรู้คำลับตั้งแต่เริ่มเกม ค่อยๆ ชี้นำกลุ่มให้ทายถูกทันเวลาโดยไม่ให้ใครสงสัย หากคนอื่นโหวตจับคุณไม่ได้ คุณชนะคนเดียว!',
    Icon: KeyRound,
  },
  COMMONER: {
    nameTh: 'ชาวบ้าน',
    nameEn: 'Commoner',
    teamLabel: 'ฝ่ายชาวบ้านและมาสเตอร์',
    teamClass: 'bg-[var(--accent-commoner)]/15 text-[var(--accent-commoner)] border-[var(--accent-commoner)]/35',
    accentColor: 'text-[var(--accent-commoner)]',
    emblemClass: 'bg-[var(--accent-commoner)]/15 text-[var(--accent-commoner)] border-[var(--accent-commoner)]/35',
    desc: 'คุณไม่รู้คำลับ ช่วยกันถามคำถามใช่/ไม่ใช่ เพื่อหาคำลับให้ทันเวลา แล้วสังเกตว่าใครถามนำแปลกๆ เหมือนรู้คำตอบอยู่แล้ว!',
    Icon: User,
  },
};

export function RoleRevealPage() {
  const { gameState, setReady, advancePhase } = useGameStore();
  const [peeked, setPeeked] = useState(false);

  if (!gameState || !gameState.me.role) return null;

  const { me, players, timer, config } = gameState;
  const meta = ROLE_META[me.role];
  const RoleIcon = meta.Icon;
  const myPlayer = players.find((p) => p.id === me.id);
  const masterPlayer = players.find((p) => p.isMaster);
  const readyCount = players.filter((p) => p.isReady).length;
  const isManualHost = config.controlMode === 'MANUAL_HOST' && me.isHost;

  return (
    <div
      className="mx-auto flex min-h-screen max-w-[1120px] flex-col gap-4 px-5 py-5"
      data-testid="phase-role-reveal"
    >
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="เปิดการ์ดบทบาทลับ" />
      <TimerBar timer={timer} label="ดูบทบาทส่วนตัวแล้วซ่อนหน้าจอไว้" />

      {masterPlayer && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--accent-master)]/40 bg-[var(--accent-master)]/10 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Shield aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-master)]" />
            <span>
              รอบที่ {gameState.roundNumber}: <strong>{masterPlayer.name}</strong> คือ{' '}
              <strong>มาสเตอร์ (Master)</strong>
            </span>
          </div>
          <span className="font-mono-code text-xs font-bold text-[var(--ink-secondary)]">
            พร้อมแล้ว {readyCount}/{players.length}
          </span>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Dramatic Centered Role Reveal Card (สไตล์ Werewolf Overlay Card) */}
        <section
          className="tabletop-card animate-card-pop mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl p-7 text-center"
          data-testid="role-card"
        >
          {!peeked ? (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--accent-master)]/40 bg-[var(--accent-master)]/12 text-[var(--accent-master)]">
                <Eye aria-hidden="true" className="h-9 w-9" />
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight">
                การ์ดบทบาทส่วนตัวของคุณ
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-secondary)]">
                การ์ดถูกซ่อนอยู่ — ระวังคนข้างๆ แอบดูหน้าจอ แตะปุ่มด้านล่างเมื่อพร้อมเปิดดูบทบาทลับ
              </p>

              <button
                type="button"
                data-testid="toggle-role-visibility"
                onClick={() => setPeeked(true)}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-master)] px-5 text-base font-bold text-white transition-opacity hover:opacity-95"
              >
                <Eye aria-hidden="true" className="h-5 w-5" />
                แตะเพื่อเปิดดูบทบาท
              </button>
            </>
          ) : (
            <>
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 ${meta.emblemClass}`}
              >
                <RoleIcon aria-hidden="true" className="h-9 w-9" />
              </div>

              <div className="text-xs font-semibold text-[var(--ink-secondary)]">
                บทบาทของคุณคือ
              </div>
              <h1
                data-testid="my-role-label"
                className={`font-display mt-1 text-3xl font-bold tracking-tight ${meta.accentColor}`}
              >
                {meta.nameTh} ({meta.nameEn})
              </h1>

              <div className="mt-2.5">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${meta.teamClass}`}
                >
                  {meta.teamLabel}
                </span>
              </div>

              {me.secretWord ? (
                <div
                  data-testid="secret-word-box"
                  className="mt-5 w-full rounded-xl border border-dashed border-[var(--accent-insider)]/50 bg-[var(--accent-insider)]/8 px-4 py-3.5"
                >
                  <div className="text-xs font-semibold text-[var(--ink-secondary)]">
                    คำลับประจำรอบนี้
                  </div>
                  <div
                    data-testid="secret-word-value"
                    className="font-display mt-1 text-3xl font-bold tracking-tight text-[var(--accent-insider)]"
                  >
                    {me.secretWord}
                  </div>
                </div>
              ) : (
                <div
                  data-testid="no-secret-word-box"
                  className="mt-5 w-full rounded-xl bg-[var(--bg-subtle)]/80 px-4 py-3 text-xs font-medium text-[var(--ink-secondary)]"
                >
                  คุณไม่รู้คำลับ — ช่วยกันถามคำถามกับมาสเตอร์เพื่อหาคำตอบให้เจอ!
                </div>
              )}

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ink-secondary)]">
                {meta.desc}
              </p>

              <button
                type="button"
                data-testid="toggle-role-visibility"
                onClick={() => setPeeked(false)}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-subtle)] px-4 text-sm font-bold text-[var(--ink-primary)] transition-colors hover:bg-[var(--border-card)]/60"
              >
                <EyeOff aria-hidden="true" className="h-4 w-4" />
                ซ่อนการ์ดกลับ (ป้องกันคนแอบดู)
              </button>
            </>
          )}

          {/* ปุ่มยืนยันพร้อมเริ่มเกม */}
          <div className="mt-3 w-full space-y-2.5 border-t border-[var(--border-card)] pt-4">
            <button
              type="button"
              data-testid="btn-confirm-role"
              onClick={() => void setReady(!myPlayer?.isReady)}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${
                myPlayer?.isReady
                  ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[var(--accent-insider)] text-white hover:opacity-95'
              }`}
            >
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              {myPlayer?.isReady ? 'ยืนยันแล้ว — รอเพื่อนคนอื่น…' : 'ดูบทบาทแล้ว — พร้อมเริ่มเกม!'}
            </button>

            {isManualHost && (
              <button
                type="button"
                data-testid="btn-host-advance-question"
                onClick={() => void advancePhase()}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-master)]/45 bg-[var(--accent-master)]/12 px-4 text-xs font-bold text-[var(--accent-master)] transition-colors hover:bg-[var(--accent-master)]/20"
              >
                <FastForward aria-hidden="true" className="h-4 w-4" />
                หัวหน้าห้อง: เริ่มเฟสถาม-ตอบทันที
              </button>
            )}
          </div>
        </section>

        {/* รายชื่อผู้เล่นและสถานะพร้อม */}
        <aside className="tabletop-card rounded-2xl p-5">
          <h2 className="mb-3 font-display text-base font-bold">สถานะความพร้อม</h2>
          <PlayerList players={players} myId={me.id} showReady />
        </aside>
      </div>
    </div>
  );
}
