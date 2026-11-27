import { Bot, Cat, Crown, Flame, Ghost, Heart, Sparkles, Star, User, Zap } from 'lucide-react';
export const AVATAR_PRESETS = [
    { id: 'preset:crimson', label: 'แดงเข้ม', bg: 'bg-[#c93022] text-white', Icon: Flame },
    { id: 'preset:amber', label: 'ทองอำพัน', bg: 'bg-[#b5730c] text-white', Icon: Crown },
    { id: 'preset:teal', label: 'เขียวน้ำทะเล', bg: 'bg-[#21616e] text-white', Icon: Sparkles },
    { id: 'preset:indigo', label: 'น้ำเงินเข้ม', bg: 'bg-[#3b4cc0] text-white', Icon: Star },
    { id: 'preset:rose', label: 'ชมพูเข้ม', bg: 'bg-[#be2d64] text-white', Icon: Heart },
    { id: 'preset:emerald', label: 'เขียวมรกต', bg: 'bg-[#1d7a56] text-white', Icon: Zap },
    { id: 'preset:violet', label: 'ม่วงคราม', bg: 'bg-[#6b3fa0] text-white', Icon: Ghost },
    { id: 'preset:slate', label: 'เทาเข้ม', bg: 'bg-[#3c424f] text-white', Icon: Cat },
];
export function PlayerAvatar({ name, avatar, isBot = false, isMaster = false, size = 'md', }) {
    const sizeClass = size === 'lg' ? 'h-12 w-12 text-sm' : size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs';
    const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
    if (avatar && avatar.startsWith('data:image/')) {
        return (<img src={avatar} width={size === 'lg' ? 48 : size === 'sm' ? 28 : 36} height={size === 'lg' ? 48 : size === 'sm' ? 28 : 36} alt={`รูปโปรไฟล์ของ ${name}`} className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ${isMaster ? 'ring-[var(--accent-master)]' : 'ring-[var(--border-card)]'}`}/>);
    }
    const preset = AVATAR_PRESETS.find((p) => p.id === avatar);
    if (preset) {
        const Icon = preset.Icon;
        return (<div aria-hidden="true" className={`${sizeClass} ${preset.bg} flex shrink-0 items-center justify-center rounded-full font-bold`}>
        <Icon className={iconSize}/>
      </div>);
    }
    if (isBot) {
        return (<div aria-hidden="true" className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[var(--accent-commoner)]/18 text-[var(--accent-commoner)]`}>
        <Bot className={iconSize}/>
      </div>);
    }
    return (<div aria-hidden="true" className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border ${isMaster
            ? 'border-[var(--accent-master)] bg-[var(--accent-master)] text-white'
            : 'border-[var(--border-card)] bg-[var(--bg-table)] text-[var(--accent-master)]'}`}>
      <User className={iconSize}/>
    </div>);
}
