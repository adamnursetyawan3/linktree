/**
 * Fungsi bantu pemrosesan gambar sebelum diunggah
 */

export interface ProcessedImageResult {
  blob: Blob;
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_TARGET_SIZE = 1.8 * 1024 * 1024; // 1.8 MB
const MAX_LONG_SIDE = 1280;
const QUALITIES = [0.82, 0.7, 0.6, 0.5];

export async function processImageForUpload(file: File): Promise<ProcessedImageResult> {
  // 1. Validasi tipe berkas
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Berkas bukan gambar.');
  }

  // 2. Validasi ukuran berkas
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File terlalu besar (maks 20 MB).');
  }

  let bitmap: ImageBitmap | null = null;
  let imgElement: HTMLImageElement | null = null;
  let objectUrl: string | null = null;

  try {
    // 3. Decode dengan createImageBitmap atau fallback ke Image + URL.createObjectURL
    if (typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      } catch {
        bitmap = null;
      }
    }

    if (!bitmap) {
      try {
        objectUrl = URL.createObjectURL(file);
        imgElement = new Image();
        const loadPromise = new Promise<void>((resolve, reject) => {
          if (!imgElement) return reject(new Error('Foto tidak bisa dibaca. Coba foto lain.'));
          imgElement.onload = () => resolve();
          imgElement.onerror = () => reject(new Error('Foto tidak bisa dibaca. Coba foto lain.'));
        });
        imgElement.src = objectUrl;
        await loadPromise;
      } catch {
        throw new Error('Foto tidak bisa dibaca. Coba foto lain.');
      }
    }

    const origWidth = bitmap ? bitmap.width : (imgElement?.naturalWidth || imgElement?.width || 0);
    const origHeight = bitmap ? bitmap.height : (imgElement?.naturalHeight || imgElement?.height || 0);

    if (origWidth <= 0 || origHeight <= 0) {
      throw new Error('Foto tidak bisa dibaca. Coba foto lain.');
    }

    // 4. Rasio sisi panjang:pendek lebih dari 20:1
    const longSide = Math.max(origWidth, origHeight);
    const shortSide = Math.min(origWidth, origHeight);
    if (longSide / shortSide > 20) {
      throw new Error('Foto terlalu panjang atau terlalu lebar.');
    }

    // 5. Kecilkan agar sisi terpanjang maksimal 1280 px (jangan memperbesar)
    let initialScale = 1;
    if (longSide > MAX_LONG_SIDE) {
      initialScale = MAX_LONG_SIDE / longSide;
    }

    let curWidth = Math.max(1, Math.round(origWidth * initialScale));
    let curHeight = Math.max(1, Math.round(origHeight * initialScale));

    const canvas = document.createElement('canvas');

    let finalBlob: Blob | null = null;
    let finalWidth = curWidth;
    let finalHeight = curHeight;

    // Maksimal 4 putaran total
    for (let round = 0; round < 4; round++) {
      if (round > 0) {
        // Kecilkan dimensi 25% lalu ulangi
        curWidth = Math.max(1, Math.round(curWidth * 0.75));
        curHeight = Math.max(1, Math.round(curHeight * 0.75));
      }

      canvas.width = curWidth;
      canvas.height = curHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Gagal memproses foto.');
      }

      // Gambar ke canvas dengan latar putih (agar PNG transparan tidak hitam)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, curWidth, curHeight);

      if (bitmap) {
        ctx.drawImage(bitmap, 0, 0, curWidth, curHeight);
      } else if (imgElement) {
        ctx.drawImage(imgElement, 0, 0, curWidth, curHeight);
      }

      // Coba kualitas [0.82, 0.7, 0.6, 0.5]
      for (const quality of QUALITIES) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (!b) {
                reject(new Error('Gagal memproses foto.'));
              } else {
                resolve(b);
              }
            },
            'image/jpeg',
            quality
          );
        });

        if (blob.size <= MAX_TARGET_SIZE) {
          finalBlob = blob;
          finalWidth = curWidth;
          finalHeight = curHeight;
          break;
        }
      }

      if (finalBlob) {
        break;
      }
    }

    if (!finalBlob) {
      throw new Error('Foto terlalu besar. Pilih foto lain.');
    }

    return {
      blob: finalBlob,
      width: finalWidth,
      height: finalHeight,
    };
  } finally {
    // Bebaskan sumber daya
    if (bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
