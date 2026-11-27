import { Bot, Check, Clock, Copy, Link2, Minus, Play, Plus, Settings2, ShieldCheck, Smartphone, Sparkles, Trash2, Users, Volume2, X } from 'lucide-react';
import { useState } from 'react';
import { GameSelect } from '../components/GameSelect';
import { PlayerList } from '../components/PlayerList';
import { QrCodeBox } from '../components/QrCodeBox';
import { UtilityBar } from '../components/UtilityBar';
import { speakThai } from '../lib/feedback';
import { useGameStore } from '../store/useGameStore';

const CONTROL_MODES = [
    {
        id: 'AUTO',
        title: 'โหมดอัตโนมัติ (แนะนำ)',
        desc: 'สุ่มมาสเตอร์และคุมเวลาอัตโนมัติ สั่นเตือนส่วนตัว ไม่เปิดเสียงบรรยายออกลำโพง',
        Icon: Smartphone,
    },
    {
        id: 'NARRATOR',
        title: 'เสียงบรรยายกลาง (Voice Narrator)',
        desc: 'เปิดเสียงพากย์ภาษาไทยจากเครื่องหัวหน้าห้อง ประกาศทุกเฟสให้ทั้งวงได้ยิน',
        Icon: Volume2,
    },
    {
        id: 'MANUAL_HOST',
        title: 'หัวหน้าห้องคุมเกม (Manual Master)',
        desc: 'หัวหน้าห้องรับบทมาสเตอร์ประจำโต๊ะ กดข้ามเฟสและเลือกคนพูดทายถูกสดๆ ได้เอง',
        Icon: ShieldCheck,
    },
];
const CATEGORIES = [
    { value: 'ALL', label: 'ทุกหมวดหมู่ (สุ่มทั้งหมด)', hint: 'รวมคำลับทั้ง 80 คำทุกหมวด' },
    { value: 'CUSTOM', label: 'คำลับที่เพิ่มเอง (Custom)', hint: 'สุ่มจากคำลับที่หัวหน้าห้องพิมพ์เพิ่มเอง' },
    { value: 'EVERYDAY', label: 'ของใช้ใกล้ตัว', hint: 'ร่ม, เข็มทิศ, นาฬิกาทราย…' },
    { value: 'FOOD', label: 'อาหารและเครื่องดื่ม', hint: 'ผัดไทย, ส้มตำ, ครัวซองต์…' },
    { value: 'NATURE', label: 'ธรรมชาติและสัตว์', hint: 'ภูเขาไฟ, แสงเหนือ, ปลาหมึกยักษ์…' },
    { value: 'PLACES', label: 'สถานที่', hint: 'ประภาคาร, หอดูดาว, ตลาดน้ำ…' },
    { value: 'CONCEPTS', label: 'แนวคิดนามธรรม', hint: 'แรงโน้มถ่วง, ความฝัน, ภาพลวงตา…' },
];
const TIME_PRESETS = [
    { sec: 180, label: '3 นาที' },
    { sec: 300, label: '5 นาที (ต้นฉบับ)' },
    { sec: 420, label: '7 นาที' },
];
export function LobbyPage() {
    const { gameState, setReady, startGame, updateConfig, updateCustomWords, addBot, kickPlayer, error } = useGameStore();
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [wordDraft, setWordDraft] = useState('');
    if (!gameState)
        return null;
    const { roomCode, players, me, config } = gameState;
    const customWords = gameState.customWords ?? [];
    const customWordCount = gameState.customWordCount ?? 0;

    const handleAddCustomWords = (e) => {
        e.preventDefault();
        if (!me.isHost || !wordDraft.trim())
            return;
        const incoming = wordDraft
            .split(/[,\n]+/)
            .map((w) => w.trim())
            .filter(Boolean);
        if (incoming.length === 0)
            return;
        const merged = [...customWords, ...incoming];
        setWordDraft('');
        void updateCustomWords(merged);
    };

    const handleRemoveCustomWord = (wordToRemove) => {
        if (!me.isHost)
            return;
        void updateCustomWords(customWords.filter((w) => w !== wordToRemove));
    };
    const myPlayer = players.find((p) => p.id === me.id);
    const canStart = me.isHost && players.length >= config.minPlayers;
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 1800);
        }
        catch {
            // ignore clipboard errors
        }
    };
    const copyInviteLink = async () => {
        try {
            const url = `${window.location.origin}/?room=${encodeURIComponent(roomCode)}`;
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 1800);
        }
        catch {
            // ignore clipboard errors
        }
    };
    const questionMinutes = Math.max(1, Math.round(config.questionDurationSec / 60));
    const adjustQuestionMinutes = (deltaMin) => {
        if (!me.isHost)
            return;
        const nextMin = Math.max(1, Math.min(10, questionMinutes + deltaMin));
        void updateConfig({ questionDurationSec: nextMin * 60 });
    };
    return (<div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-5 py-6" data-testid="phase-lobby">
      {/* แถบบนแบบ Werewolf: QR + รหัสห้องอยู่ซ้าย, ปุ่มควบคุมอยู่ขวา */}
      <div className="tabletop-card animate-card-pop flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-center gap-3.5">
          <QrCodeBox roomCode={roomCode} size={86}/>
          <div>
            <div className="text-xs font-medium text-[var(--ink-secondary)]">
              สแกน QR หรือกรอกรหัสห้อง ({config.minPlayers}–{config.maxPlayers} คน)
            </div>
            <div translate="no" data-testid="lobby-room-code" className="font-mono-code mt-0.5 text-2xl font-bold tracking-[0.2em]">
              {roomCode}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void copyCode()} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-table)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--bg-subtle)]">
                {copiedCode ? (<Check aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600"/>) : (<Copy aria-hidden="true" className="h-3.5 w-3.5"/>)}
                {copiedCode ? 'คัดลอกรหัสแล้ว' : 'คัดลอกรหัส'}
              </button>
              <button type="button" data-testid="btn-copy-invite" onClick={() => void copyInviteLink()} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-table)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--bg-subtle)]">
                {copiedLink ? (<Check aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600"/>) : (<Link2 aria-hidden="true" className="h-3.5 w-3.5"/>)}
                {copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์ชวนเพื่อน'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <UtilityBar showLeave/>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" data-testid="btn-toggle-ready" onClick={() => void setReady(!myPlayer?.isReady)} className={`h-10 rounded-xl px-4 text-sm font-bold transition-colors ${myPlayer?.isReady
            ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'border border-[var(--border-card)] bg-[var(--bg-subtle)] hover:opacity-90'}`}>
              {myPlayer?.isReady ? 'พร้อมเล่นแล้ว ✓' : 'กดพร้อมเล่น'}
            </button>

            {me.isHost && players.length < config.maxPlayers && (<button type="button" data-testid="btn-add-bot" onClick={() => void addBot()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-3.5 text-sm font-bold transition-colors hover:bg-[var(--bg-subtle)]">
                <Bot aria-hidden="true" className="h-4 w-4 text-[var(--accent-commoner)]"/>
                เพิ่มบอท (+1)
              </button>)}

            {me.isHost && (<button type="button" data-testid="btn-start-game" disabled={!canStart} onClick={() => void startGame()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--accent-insider)] px-5 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45">
                <Play aria-hidden="true" className="h-4 w-4"/>
                เริ่มเกมเลย
              </button>)}
          </div>
        </div>
      </div>

      {error && (<div role="alert" aria-live="polite" data-testid="error-banner" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>)}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]">
        {/* รายชื่อผู้เล่น */}
        <section className="tabletop-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Users aria-hidden="true" className="h-5 w-5 text-[var(--accent-commoner)]"/>
              <span className="tabular-nums">
                ผู้เล่น ({players.length}/{config.maxPlayers})
              </span>
            </h2>
            {players.length < config.minPlayers && (<span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                รออีก {config.minPlayers - players.length} คน
              </span>)}
          </div>
          <PlayerList players={players} myId={me.id} showReady canKick={me.isHost} onKick={(id) => void kickPlayer(id)}/>
        </section>

        {/* ตั้งค่ากติกา (Custom Tabletop Controls) */}
        <section className="tabletop-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border-card)] pb-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Settings2 aria-hidden="true" className="h-5 w-5 text-[var(--accent-master)]"/>
              ตั้งค่ากติกา
            </h2>
            {!me.isHost && (<span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-secondary)]">
                หัวหน้าห้องปรับได้
              </span>)}
          </div>

          <div className="space-y-5 text-sm">
            {/* โหมดการคุมเกม (เหมือน Werewolf: AUTO / NARRATOR / MANUAL_HOST) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[var(--ink-secondary)]">โหมดการคุมเกม</span>
                {config.controlMode === 'NARRATOR' && (
                  <button
                    type="button"
                    onClick={() => speakThai('ทดสอบเสียงบรรยายกลาง เกมอินไซเดอร์พร้อมเริ่มแล้ว')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent-master)]/40 bg-[var(--accent-master)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--accent-master)] transition-colors hover:bg-[var(--accent-master)]/20"
                  >
                    <Volume2 aria-hidden="true" className="h-3 w-3" />
                    ทดสอบเสียงบรรยาย
                  </button>
                )}
              </div>
              <div className="space-y-2" data-testid="config-control-mode">
                {CONTROL_MODES.map((m) => {
                  const Icon = m.Icon;
                  const active = (config.controlMode || 'AUTO') === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!me.isHost}
                      data-testid={`control-mode-${m.id}`}
                      aria-pressed={active}
                      onClick={() => void updateConfig({ controlMode: m.id })}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? 'border-[var(--accent-insider)] bg-[var(--accent-insider)]/10'
                          : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? 'bg-[var(--accent-insider)] text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--ink-secondary)]'
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold ${
                            active ? 'text-[var(--accent-insider)]' : 'text-[var(--ink-primary)]'
                          }`}
                        >
                          {m.title}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-[var(--ink-secondary)]">
                          {m.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* เวลาเฟสถาม-ตอบ: Preset pills + Stepper (หน่วยเป็นนาที) */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink-secondary)]">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5"/>
                  เวลาเฟสถาม-ตอบ
                </span>
                <span className="font-mono-code text-xs font-bold text-[var(--ink-primary)]">
                  {questionMinutes} นาที
                </span>
              </div>

              <div className="mb-2 grid grid-cols-3 gap-1.5">
                {TIME_PRESETS.map((preset) => {
            const active = config.questionDurationSec === preset.sec;
            return (<button key={preset.sec} type="button" disabled={!me.isHost} onClick={() => void updateConfig({ questionDurationSec: preset.sec })} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${active
                    ? 'border-[var(--accent-insider)] bg-[var(--accent-insider)]/12 text-[var(--accent-insider)]'
                    : 'border-[var(--border-card)] bg-[var(--bg-table)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'}`}>
                      {preset.label}
                    </button>);
        })}
              </div>

              <div className="flex items-center gap-2">
                <button type="button" disabled={!me.isHost || questionMinutes <= 1} aria-label="ลดเวลา 1 นาที" onClick={() => adjustQuestionMinutes(-1)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] transition-colors hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-45">
                  <Minus aria-hidden="true" className="h-4 w-4"/>
                </button>
                <div data-testid="config-question-duration" className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-3 text-sm font-bold text-[var(--ink-primary)]">
                  <span className="font-mono-code text-base">{questionMinutes}</span>
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">นาที</span>
                </div>
                <button type="button" disabled={!me.isHost || questionMinutes >= 10} aria-label="เพิ่มเวลา 1 นาที" onClick={() => adjustQuestionMinutes(1)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] transition-colors hover:bg-[var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-45">
                  <Plus aria-hidden="true" className="h-4 w-4"/>
                </button>
              </div>
            </div>

            {/* รูปแบบการโหวต: Segmented Choice Cards */}
            <div>
              <span className="mb-1.5 block text-xs font-bold text-[var(--ink-secondary)]">
                รูปแบบการโหวต
              </span>
              <div className="grid grid-cols-2 gap-2" data-testid="config-voting-mode">
                <button type="button" disabled={!me.isHost} aria-pressed={config.votingMode === 'TWO_STAGE'} onClick={() => void updateConfig({ votingMode: 'TWO_STAGE' })} className={`rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${config.votingMode === 'TWO_STAGE'
            ? 'border-[var(--accent-insider)] bg-[var(--accent-insider)]/10'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'}`}>
                  <div className={`text-xs font-bold ${config.votingMode === 'TWO_STAGE'
            ? 'text-[var(--accent-insider)]'
            : 'text-[var(--ink-primary)]'}`}>
                    ต้นฉบับ 2 ขั้นตอน
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">
                    โหวตคนทายถูก → ชี้ตัว
                  </div>
                </button>

                <button type="button" disabled={!me.isHost} aria-pressed={config.votingMode === 'DIRECT'} onClick={() => void updateConfig({ votingMode: 'DIRECT' })} className={`rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${config.votingMode === 'DIRECT'
            ? 'border-[var(--accent-insider)] bg-[var(--accent-insider)]/10'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'}`}>
                  <div className={`text-xs font-bold ${config.votingMode === 'DIRECT'
            ? 'text-[var(--accent-insider)]'
            : 'text-[var(--ink-primary)]'}`}>
                    โหวตชี้ตัวโดยตรง
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">
                    เลือกผู้ต้องสงสัยทันที
                  </div>
                </button>
              </div>
            </div>

            {/* เวลาเฟสถกเถียง: Segmented Choice Cards */}
            <div>
              <span className="mb-1.5 block text-xs font-bold text-[var(--ink-secondary)]">
                เวลาเฟสถกเถียง
              </span>
              <div className="grid grid-cols-2 gap-2" data-testid="config-discussion-mode">
                <button type="button" disabled={!me.isHost} aria-pressed={config.discussionMode === 'FLIPPED_TIMER'} onClick={() => void updateConfig({ discussionMode: 'FLIPPED_TIMER' })} className={`rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${config.discussionMode === 'FLIPPED_TIMER'
            ? 'border-[var(--accent-master)] bg-[var(--accent-master)]/12'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'}`}>
                  <div className={`text-xs font-bold ${config.discussionMode === 'FLIPPED_TIMER'
            ? 'text-[var(--accent-master)]'
            : 'text-[var(--ink-primary)]'}`}>
                    พลิกนาฬิกาทราย
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">
                    เท่ากับเวลาที่ใช้ทายคำ
                  </div>
                </button>

                <button type="button" disabled={!me.isHost} aria-pressed={config.discussionMode === 'FIXED'} onClick={() => void updateConfig({ discussionMode: 'FIXED' })} className={`rounded-xl border p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${config.discussionMode === 'FIXED'
            ? 'border-[var(--accent-master)] bg-[var(--accent-master)]/12'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'}`}>
                  <div className={`text-xs font-bold ${config.discussionMode === 'FIXED'
            ? 'text-[var(--accent-master)]'
            : 'text-[var(--ink-primary)]'}`}>
                    กำหนดตายตัว
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">
                    คงที่ {Math.max(1, Math.round(config.fixedDiscussionSec / 60))} นาที
                  </div>
                </button>
              </div>
            </div>

            {/* หมวดหมู่คำลับ: Custom Styled Dropdown */}
            <GameSelect label="หมวดหมู่คำลับ" value={config.wordCategory} options={CATEGORIES} disabled={!me.isHost} testId="config-word-category" onChange={(wordCategory) => void updateConfig({ wordCategory })}/>

            {/* เพิ่มคำลับเอง (Custom Words — เฉพาะหัวหน้าห้องเห็นรายการเพื่อกันคนอื่นแอบดู) */}
            <div className="space-y-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink-primary)]">
                  <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[var(--accent-master)]" />
                  เพิ่มคำลับเอง ({customWordCount} คำ)
                </span>
                {me.isHost && customWords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void updateCustomWords([])}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                  >
                    <Trash2 aria-hidden="true" className="h-3 w-3" />
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              {me.isHost ? (
                <>
                  <form onSubmit={handleAddCustomWords} className="flex gap-2">
                    <input
                      type="text"
                      data-testid="input-custom-word"
                      maxLength={120}
                      autoComplete="off"
                      placeholder="พิมพ์คำลับ (คั่นด้วย , เพื่อเพิ่มหลายคำ)…"
                      value={wordDraft}
                      onChange={(e) => setWordDraft(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] focus:border-[var(--accent-insider)]"
                    />
                    <button
                      type="submit"
                      data-testid="btn-add-custom-word"
                      disabled={!wordDraft.trim()}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--accent-master)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-45"
                    >
                      <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                      เพิ่ม
                    </button>
                  </form>

                  {customWords.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1" data-testid="custom-word-list">
                      {customWords.map((w) => (
                        <span
                          key={w}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-master)]/35 bg-[var(--bg-card)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-primary)]"
                        >
                          <span>{w}</span>
                          <button
                            type="button"
                            aria-label={`ลบคำว่า ${w}`}
                            onClick={() => handleRemoveCustomWord(w)}
                            className="rounded-full p-0.5 text-[var(--ink-secondary)] hover:bg-red-500/15 hover:text-red-600"
                          >
                            <X aria-hidden="true" className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--ink-secondary)]">
                      พิมพ์คำที่อยากเล่นเอง (เช่น ชื่อเพื่อน, หมูกระทะ, ชานมไข่มุก) ระบบจะซ่อนรายการนี้จากผู้เล่นคนอื่นในห้อง
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-[var(--ink-secondary)]">
                  {customWordCount > 0
                    ? `หัวหน้าห้องเตรียมคำลับพิเศษไว้ ${customWordCount} คำ (ซ่อนไว้เพื่อกันสปอยล์)`
                    : 'ยังไม่มีคำลับที่เพิ่มเอง (ใช้คลังคำลับมาตรฐาน)'}
                </p>
              )}
            </div>

            {/* ให้มาสเตอร์ร่วมโหวตด้วย: Custom Toggle Switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-3.5 py-3">
              <div>
                <div className="text-xs font-bold text-[var(--ink-primary)]">
                  ให้มาสเตอร์ร่วมโหวตด้วย
                </div>
                <div className="text-[11px] text-[var(--ink-secondary)]">
                  ตามกติกาต้นฉบับ มาสเตอร์โหวตจับอินไซเดอร์ได้
                </div>
              </div>
              <button type="button" role="switch" aria-checked={config.masterCanVote} aria-label="ให้มาสเตอร์ร่วมโหวตด้วย" disabled={!me.isHost} onClick={() => void updateConfig({ masterCanVote: !config.masterCanVote })} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${config.masterCanVote ? 'bg-[var(--accent-insider)]' : 'bg-[var(--border-card)]'}`}>
                <span aria-hidden="true" className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${config.masterCanVote ? 'translate-x-5.5' : 'translate-x-1'}`}/>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>);
}
