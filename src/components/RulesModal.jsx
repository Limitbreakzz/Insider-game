import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
export function RulesModal() {
    const { rulesOpen, setRulesOpen } = useGameStore();
    useEffect(() => {
        if (!rulesOpen)
            return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape')
                setRulesOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [rulesOpen, setRulesOpen]);
    if (!rulesOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title" onClick={(e) => {
            if (e.target === e.currentTarget)
                setRulesOpen(false);
        }}>
      <div className="tabletop-card animate-card-pop max-h-[85vh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
          <h2 id="rules-modal-title" className="font-display text-xl font-bold">
            วิธีเล่นเกม Insider (กติกาต้นฉบับ Oink Games)
          </h2>
          <button type="button" onClick={() => setRulesOpen(false)} aria-label="ปิดหน้าต่างกติกา" className="rounded-lg p-1.5 transition-colors hover:bg-[var(--bg-subtle)]">
            <X aria-hidden="true" className="h-5 w-5"/>
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--ink-secondary)]">
          <p>
            <strong>Insider</strong> เป็นเกมปาร์ตี้ทายคำและจับโกหกสำหรับ 4–8 คน
            ทุกคนต้องร่วมมือกันทายคำลับให้ทันเวลา แต่มี 1 คนที่แอบรู้คำตอบอยู่แล้ว!
          </p>

          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
              1. บทบาททั้ง 3 แบบ
            </h3>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-[var(--accent-master)]">มาสเตอร์ (1 คน):</strong>{' '}
                เปิดเผยตัวตน รู้คำลับ ทำหน้าที่ตอบคำถามด้วย <em>ใช่</em>, <em>ไม่ใช่</em> หรือ{' '}
                <em>ไม่รู้</em>
              </li>
              <li>
                <strong className="text-[var(--accent-insider)]">อินไซเดอร์ (1 คน):</strong>{' '}
                ซ่อนตัวตน รู้คำลับตั้งแต่ต้น ต้องเนียนชี้นำให้กลุ่มทายถูกโดยไม่ให้ถูกจับได้
              </li>
              <li>
                <strong className="text-[var(--accent-commoner)]">ชาวบ้าน (ที่เหลือ):</strong>{' '}
                ไม่รู้คำลับ ต้องช่วยกันถามคำถามจนทายถูก แล้วช่วยกันจับตัวอินไซเดอร์
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
              2. เฟสถาม-ตอบ (จับเวลา 5 นาที)
            </h3>
            <p className="mt-1">
              ผู้เล่นถามคำถามใช่/ไม่ใช่ หรือพิมพ์ทายคำลับได้ตลอด{' '}
              <strong>ถ้าหมดเวลาก่อนทายถูก ทุกคนแพ้ทั้งหมด (รวมถึงอินไซเดอร์ด้วย!)</strong>
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
              3. เฟสถกเถียง (พลิกนาฬิกาทราย)
            </h3>
            <p className="mt-1">
              เมื่อมีคนทายคำลับถูก นาฬิกาทรายจะถูกพลิกกลับ เวลาที่ใช้ถกเถียงจะเท่ากับเวลาที่ใช้ทายคำ
              ให้ทุกคนย้อนดูประวัติคำถามแล้วจับพิรุธว่าใครดูเหมือนรู้คำตอบอยู่แล้ว
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
              4. โหวต 2 ขั้นตอน และเงื่อนไขการชนะ
            </h3>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
              <li>
                <strong>ขั้นที่ 1:</strong> โหวต <em>ใช่</em> หรือ <em>ไม่ใช่</em>{' '}
                ว่าคนที่ทายคำถูกคืออินไซเดอร์หรือไม่ ถ้าเสียงส่วนใหญ่โหวต <em>ใช่</em> จะตัดสินทันที
              </li>
              <li>
                <strong>ขั้นที่ 2:</strong> ถ้าไม่ถึงเสียงส่วนใหญ่ ทุกคนเลือกชี้ตัวผู้ต้องสงสัย
                (ห้ามโหวตมาสเตอร์) หากคะแนนเท่ากัน คนทายคำถูกจะเป็นผู้ชี้ขาด
              </li>
              <li>
                <strong>ผลการตัดสิน:</strong> ถ้าจับอินไซเดอร์ถูก{' '}
                <strong>ชาวบ้านและมาสเตอร์ชนะ</strong> แต่ถ้าจับผิดคน{' '}
                <strong>อินไซเดอร์ชนะคนเดียว!</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>);
}
