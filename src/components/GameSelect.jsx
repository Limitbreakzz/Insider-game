import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
export function GameSelect({ label, value, options, disabled = false, testId, onChange, }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonId = useId();
    const listboxId = useId();
    const selected = options.find((o) => o.value === value) ?? options[0];
    useEffect(() => {
        if (!open)
            return;
        const handlePointerDown = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);
    return (<div ref={containerRef} className="relative">
      <label htmlFor={buttonId} className="mb-1.5 block text-xs font-bold text-[var(--ink-secondary)]">
        {label}
      </label>

      <button id={buttonId} type="button" disabled={disabled} data-testid={testId} aria-haspopup="listbox" aria-expanded={open} aria-controls={listboxId} onClick={() => !disabled && setOpen((prev) => !prev)} className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${open
            ? 'border-[var(--accent-insider)] bg-[var(--bg-card)]'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]/50'}`}>
        <span className="truncate text-[var(--ink-primary)]">{selected?.label}</span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[var(--ink-secondary)] transition-transform duration-200 ${open ? 'rotate-180 text-[var(--accent-insider)]' : ''}`}/>
      </button>

      {open && (<ul id={listboxId} role="listbox" aria-labelledby={buttonId} className="tabletop-card animate-card-pop absolute left-0 right-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl p-1.5">
          {options.map((opt) => {
                const isSelected = opt.value === value;
                return (<li key={opt.value} role="option" aria-selected={isSelected}>
                <button type="button" onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                    }} className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${isSelected
                        ? 'bg-[var(--accent-insider)]/12 font-bold text-[var(--accent-insider)]'
                        : 'font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)]'}`}>
                  <div className="min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.hint && (<div className="truncate text-[11px] font-normal text-[var(--ink-secondary)]">
                        {opt.hint}
                      </div>)}
                  </div>
                  {isSelected && (<Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent-insider)]"/>)}
                </button>
              </li>);
            })}
        </ul>)}
    </div>);
}
