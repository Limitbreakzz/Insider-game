import { Eye, EyeOff, KeyRound, Shield, User } from 'lucide-react';
import { useState } from 'react';
const ROLE_META = {
    MASTER: {
        title: 'มาสเตอร์ (Master)',
        subtitle: 'เปิดเผยตัวตน • ผู้คุมคำลับประจำรอบ',
        colorClass: 'border-[var(--accent-master)]',
        badgeClass: 'bg-[var(--accent-master)] text-white',
        tip: 'ตอบคำถามเพื่อนด้วย “ใช่”, “ไม่ใช่” หรือ “ไม่รู้” ห้ามหลุดบอกคำลับตรงๆ และหลังทายถูก ให้ช่วยชาวบ้านจับตัวอินไซเดอร์ด้วย!',
    },
    INSIDER: {
        title: 'อินไซเดอร์ (Insider)',
        subtitle: 'บทบาทลับ • รู้คำลับตั้งแต่เริ่มเกม',
        colorClass: 'border-[var(--accent-insider)]',
        badgeClass: 'bg-[var(--accent-insider)] text-white',
        tip: 'ค่อยๆ ชี้นำเพื่อนให้ทายคำลับให้ทันเวลา แต่ต้องเนียนอย่าให้ใครจับได้ ถ้าคนอื่นโหวตจับคุณไม่ได้ คุณชนะคนเดียว!',
    },
    COMMONER: {
        title: 'ชาวบ้าน (Commoner)',
        subtitle: 'บทบาทลับ • ตามหาคำลับและจับอินไซเดอร์',
        colorClass: 'border-[var(--accent-commoner)]',
        badgeClass: 'bg-[var(--accent-commoner)] text-white',
        tip: 'ช่วยกันถามคำถามใช่/ไม่ใช่ เพื่อหาคำลับให้ทันเวลา แล้วสังเกตให้ดีว่าใครถามนำแปลกๆ เหมือนรู้คำตอบอยู่แล้ว!',
    },
};
export function RoleCard({ role, secretWord, defaultRevealed = false }) {
    const [revealed, setRevealed] = useState(defaultRevealed);
    const meta = ROLE_META[role];
    const Icon = role === 'MASTER' ? Shield : role === 'INSIDER' ? KeyRound : User;
    return (<div className={`tabletop-card animate-card-pop relative overflow-hidden rounded-2xl border-2 p-6 transition-colors ${revealed ? meta.colorClass : 'border-[var(--border-card)]'}`} data-testid="role-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-[var(--ink-secondary)]">การ์ดบทบาทลับของคุณ</span>
        <button type="button" onClick={() => setRevealed((r) => !r)} data-testid="toggle-role-visibility" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90">
          {revealed ? (<>
              <EyeOff aria-hidden="true" className="h-3.5 w-3.5"/>
              ซ่อนการ์ด
            </>) : (<>
              <Eye aria-hidden="true" className="h-3.5 w-3.5"/>
              เปิดดูการ์ด
            </>)}
        </button>
      </div>

      {!revealed ? (<div className="my-8 flex flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-subtle)]">
            <EyeOff aria-hidden="true" className="h-7 w-7 text-[var(--ink-secondary)]"/>
          </div>
          <p className="font-display text-lg font-bold">การ์ดถูกซ่อนอยู่</p>
          <p className="mt-1 max-w-xs text-xs text-[var(--ink-secondary)]">
            ระวังคนข้างๆ แอบดูหน้าจอ จากนั้นกดปุ่ม <strong>เปิดดูการ์ด</strong>
          </p>
        </div>) : (<div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.badgeClass}`}>
              <Icon aria-hidden="true" className="h-6 w-6"/>
            </div>
            <div>
              <div data-testid="my-role-label" className="font-display text-2xl font-bold tracking-tight">
                {meta.title}
              </div>
              <div className="text-xs text-[var(--ink-secondary)]">{meta.subtitle}</div>
            </div>
          </div>

          {secretWord ? (<div data-testid="secret-word-box" className="rounded-xl border border-dashed border-[var(--accent-insider)]/50 bg-[var(--accent-insider)]/8 p-4 text-center">
              <div className="text-xs font-semibold text-[var(--ink-secondary)]">
                คำลับประจำรอบนี้
              </div>
              <div data-testid="secret-word-value" className="mt-1 font-display text-3xl font-bold tracking-tight text-[var(--accent-insider)]">
                {secretWord}
              </div>
            </div>) : (<div data-testid="no-secret-word-box" className="rounded-xl bg-[var(--bg-subtle)]/70 p-4 text-center text-xs text-[var(--ink-secondary)]">
              คุณไม่รู้คำลับ ช่วยกันถามคำถามกับมาสเตอร์เพื่อหาคำตอบให้เจอ!
            </div>)}

          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">{meta.tip}</p>
        </div>)}
    </div>);
}
