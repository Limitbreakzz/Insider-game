export function compressAvatarFile(file, size = 128, quality = 0.78) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('อ่านไฟล์รูปภาพไม่สำเร็จ'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('ไม่สามารถโหลดรูปภาพได้'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('เบราว์เซอร์ไม่รองรับการย่อรูป'));
                    return;
                }
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
    });
}
