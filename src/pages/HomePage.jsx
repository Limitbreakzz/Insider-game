import { BookOpen, DoorOpen, KeyRound, RotateCcw, Shield, Trash2, Upload, Users, X, Zap, } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { UtilityBar } from '../components/UtilityBar';
import { compressAvatarFile } from '../lib/imageUtils';
import { useGameStore } from '../store/useGameStore';
const PROFILE_KEY = 'insider_profile_v1';
function loadSavedProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                name: typeof parsed.name === 'string' ? parsed.name : '',
                avatar: typeof parsed.avatar === 'string' ? parsed.avatar : '',
            };
        }
    }
    catch {
        // ignore
    }
    return { name: '', avatar: '' };
}
export function HomePage() {
    const { createRoom, joinRoom, savedSession, rejoinSavedSession, dismissSavedSession, setRulesOpen, error, clearError, connected, } = useGameStore();
    const initial = loadSavedProfile();
    const [playerName, setPlayerName] = useState(initial.name);
    const [avatar, setAvatar] = useState(initial.avatar);
    const [roomCode, setRoomCode] = useState('');
    const [uploadError, setUploadError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const hasPhoto = avatar.startsWith('data:image/');
    // รองรับลิงก์เชิญและ QR Code: /?room=ABCDEF
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const codeFromUrl = params.get('room')?.trim().toUpperCase();
        if (codeFromUrl && /^[A-Z0-9]{4,8}$/.test(codeFromUrl)) {
            setRoomCode(codeFromUrl);
        }
    }, []);
    const persistProfile = (name, av) => {
        try {
            localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, avatar: av }));
        }
        catch {
            // ignore storage quota errors
        }
    };
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file)
            return;
        setUploadError(null);
        try {
            const dataUrl = await compressAvatarFile(file, 128, 0.78);
            setAvatar(dataUrl);
            persistProfile(playerName, dataUrl);
        }
        catch (err) {
            setUploadError(err instanceof Error ? err.message : 'อัปโหลดรูปไม่สำเร็จ');
        }
    };
    const handleCreateRoom = async () => {
        if (submitting || !connected)
            return;
        const cleanName = playerName.trim();
        if (!cleanName) {
            setUploadError('กรุณาใส่ชื่อของคุณก่อนสร้างห้อง');
            return;
        }
        setUploadError(null);
        clearError();
        persistProfile(cleanName, avatar);
        setSubmitting(true);
        try {
            await createRoom(cleanName, { avatar: hasPhoto ? avatar : undefined });
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleQuickSolo = async () => {
        if (submitting || !connected)
            return;
        const cleanName = playerName.trim() || 'ผู้เล่น 1';
        setPlayerName(cleanName);
        setUploadError(null);
        clearError();
        persistProfile(cleanName, avatar);
        setSubmitting(true);
        try {
            await createRoom(cleanName, { avatar: hasPhoto ? avatar : undefined, fillBots: true });
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        if (submitting || !connected)
            return;
        const cleanName = playerName.trim();
        if (!cleanName) {
            setUploadError('กรุณาใส่ชื่อของคุณก่อนเข้าห้อง');
            return;
        }
        if (!roomCode.trim())
            return;
        setUploadError(null);
        clearError();
        persistProfile(cleanName, avatar);
        setSubmitting(true);
        try {
            await joinRoom(roomCode.trim().toUpperCase(), cleanName, hasPhoto ? avatar : undefined);
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="mx-auto flex min-h-screen max-w-[1060px] flex-col justify-center gap-7 px-6 py-9">
      {/* Inline Header (ไม่มี sticky navbar เต็มจอ — เหมือน werewolf-game-opal) */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-insider)] font-display text-sm font-bold text-white">
            IN
          </div>
          <span translate="no" className="font-display text-lg font-bold tracking-tight">
            Insider Online
          </span>
        </div>
        <UtilityBar rulesLabel="คู่มือบทบาทและกติกา"/>
      </header>

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        {/* ฝั่งซ้าย: Hero + Identity Card */}
        <section className="flex flex-col justify-between gap-5">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.18] tracking-tight sm:text-5xl">
            ช่วยกันทายคำลับ
            <br />
            <span className="text-[var(--accent-insider)]">แล้วจับตัวอินไซเดอร์</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
            เกมทายคำและจับผิดแบบเรียลไทม์ตามกติกาต้นฉบับ Oink Games เล่นออนไลน์กับเพื่อนผ่านรหัสห้อง
            6 หลัก หรือเปิดโต๊ะเล่นกับบอท AI ได้ทันที
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold">
              <Shield aria-hidden="true" className="h-3.5 w-3.5 text-[var(--accent-master)]"/>
              มาสเตอร์
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold">
              <KeyRound aria-hidden="true" className="h-3.5 w-3.5 text-[var(--accent-insider)]"/>
              อินไซเดอร์
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold">
              <Users aria-hidden="true" className="h-3.5 w-3.5 text-[var(--accent-commoner)]"/>
              ชาวบ้าน
            </span>
            <button type="button" onClick={() => setRulesOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-master)]/45 bg-[var(--accent-master)]/10 px-3 py-1 text-xs font-bold text-[var(--accent-master)] transition-colors hover:bg-[var(--accent-master)]/20">
              <BookOpen aria-hidden="true" className="h-3.5 w-3.5"/>
              คู่มือกติกา
            </button>
          </div>
        </div>

        {/* การ์ดตั้งโปรไฟล์: อัปโหลดรูป + ชื่อเล่น */}
        <div className="tabletop-card animate-card-pop space-y-5 rounded-2xl p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button type="button" onClick={() => fileInputRef.current?.click()} title="แตะเพื่อเลือกรูปโปรไฟล์" aria-label="เลือกรูปโปรไฟล์" className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border-card)] bg-[var(--bg-table)] transition-colors hover:border-[var(--accent-insider)]">
              {hasPhoto ? (<img src={avatar} width={80} height={80} alt="ตัวอย่างรูปโปรไฟล์ของคุณ" className="h-full w-full object-cover"/>) : (<PlayerAvatar name={playerName || 'IN'} size="lg"/>)}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                เปลี่ยนรูป
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[var(--ink-primary)]">รูปโปรไฟล์ของคุณ</div>
              <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
                เลือกรูปจากมือถือหรือคอมพิวเตอร์ (ไม่ใส่ก็ได้ ระบบจะย่อขนาดให้อัตโนมัติ)
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button type="button" data-testid="btn-upload-avatar" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--border-card)]/60">
                  <Upload aria-hidden="true" className="h-3.5 w-3.5"/>
                  {hasPhoto ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
                </button>
                {hasPhoto && (<button type="button" onClick={() => {
                setAvatar('');
                persistProfile(playerName, '');
            }} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400">
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5"/>
                    ลบรูป
                  </button>)}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleFileChange(e)}/>
            </div>
          </div>

          <div>
            <label htmlFor="playerName" className="mb-1.5 block text-xs font-bold text-[var(--ink-secondary)]">
              ชื่อของคุณในวงเกม
            </label>
            <input id="playerName" name="playerName" data-testid="input-player-name" type="text" maxLength={24} autoComplete="off" spellCheck={false} placeholder="เช่น ต้น, มายด์, บีม…" value={playerName} onChange={(e) => {
            setPlayerName(e.target.value);
            if (uploadError)
                setUploadError(null);
        }} className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:border-[var(--accent-insider)]"/>
          </div>
        </div>
      </section>

      {/* ฝั่งขวา: ปุ่มสร้างห้อง / เล่นด่วน / เข้าห้อง */}
      <aside className="tabletop-card animate-card-pop flex h-full flex-col justify-center gap-7 rounded-2xl p-7">
        {savedSession?.roomCode && (<div className="space-y-3 rounded-xl border border-[var(--accent-master)]/45 bg-[var(--accent-master)]/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[var(--accent-master)]">
                กลับเข้าเกมที่เล่นค้างไว้
              </h2>
              <button type="button" onClick={dismissSavedSession} aria-label="ล้างห้องเดิม" title="ล้างห้องเดิม" className="rounded-md p-1 text-[var(--ink-secondary)] transition-colors hover:bg-black/10">
                <X aria-hidden="true" className="h-4 w-4"/>
              </button>
            </div>
            <p className="text-sm text-[var(--ink-secondary)]">
              ห้องเดิม:{' '}
              <strong translate="no" className="font-mono-code text-[var(--ink-primary)]">
                {savedSession.roomCode}
              </strong>
            </p>
            <button type="button" disabled={!connected} onClick={() => void rejoinSavedSession()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-master)] px-4 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-50">
              <RotateCcw aria-hidden="true" className="h-4 w-4"/>
              กลับเข้าห้องเดิม
            </button>
          </div>)}

        {(error || uploadError) && (<div role="alert" aria-live="polite" data-testid="error-banner" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
            {error || uploadError}
          </div>)}

        {/* สร้างโต๊ะใหม่ + เล่นด่วนกับบอท */}
        <div className="space-y-3.5">
          <div>
            <h2 className="font-display text-xl font-bold">เปิดห้องเล่นใหม่</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
              สร้างห้องส่วนตัวสำหรับ 4–8 คน เชิญเพื่อนด้วยลิงก์หรือเติมบอท AI เข้าโต๊ะได้ตามต้องการ
            </p>
          </div>

          <button type="button" disabled={!connected || submitting} data-testid="btn-create-room" onClick={() => void handleCreateRoom()} className="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--accent-insider)] px-5 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
            <Users aria-hidden="true" className="h-5 w-5"/>
            <span>{submitting ? 'กำลังสร้างห้อง…' : 'สร้างห้องเล่นกับเพื่อน'}</span>
          </button>

          <button type="button" disabled={!connected || submitting} data-testid="btn-quick-solo" onClick={() => void handleQuickSolo()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent-master)]/45 bg-[var(--accent-master)]/12 px-5 text-sm font-bold text-[var(--accent-master)] transition-colors hover:bg-[var(--accent-master)]/20 disabled:cursor-not-allowed disabled:opacity-50">
            <Zap aria-hidden="true" className="h-4 w-4"/>
            <span>เล่นด่วนคนเดียวกับบอท AI (4 คน)</span>
          </button>
        </div>

        <hr className="border-[var(--border-card)]"/>

        {/* เข้าร่วมด้วยรหัสห้อง */}
        <form onSubmit={handleJoinSubmit} className="space-y-3.5">
          <div>
            <h2 className="font-display text-xl font-bold">เข้าร่วมห้องที่มีอยู่</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
              กรอกรหัสห้อง 6 ตัวอักษรจากหัวหน้าห้องเพื่อเข้าสู่โต๊ะ
            </p>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
            <input id="roomCode" name="roomCode" aria-label="รหัสห้อง" data-testid="input-room-code" type="text" maxLength={8} required autoComplete="off" spellCheck={false} placeholder="ABCDEF" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} className="font-mono-code h-12 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-table)] px-4 text-center text-base font-bold uppercase tracking-widest transition-colors focus:border-[var(--accent-insider)]"/>
            <button type="submit" disabled={!connected || submitting || !roomCode.trim()} data-testid="btn-join-room" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent-commoner)] px-5 text-base font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
              <DoorOpen aria-hidden="true" className="h-4 w-4"/>
              เข้าร่วม
            </button>
          </div>
        </form>
      </aside>
      </div>
    </div>);
}
