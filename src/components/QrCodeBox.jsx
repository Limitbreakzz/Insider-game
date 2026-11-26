import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
export function QrCodeBox({ roomCode, size = 86 }) {
    const [dataUrl, setDataUrl] = useState('');
    const inviteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/?room=${encodeURIComponent(roomCode)}`
        : '';
    useEffect(() => {
        if (!inviteUrl)
            return;
        let active = true;
        QRCode.toDataURL(inviteUrl, {
            width: size * 2,
            margin: 1,
            color: { dark: '#191715', light: '#ffffff' },
        })
            .then((url) => {
            if (active)
                setDataUrl(url);
        })
            .catch(() => { });
        return () => {
            active = false;
        };
    }, [inviteUrl, size]);
    if (!dataUrl)
        return null;
    return (<div data-testid="qr-code-box" className="shrink-0 rounded-xl border border-[var(--border-card)] bg-white p-1.5">
      <img src={dataUrl} width={size} height={size} alt={`คิวอาร์โค้ดสำหรับเข้าห้อง ${roomCode}`} style={{ width: size, height: size }} className="block rounded-md"/>
    </div>);
}
