import JSZip from 'jszip';
import { ExtensionConfig } from '../types';
import { generateExtensionFiles } from './generator';

// Fallback Indigo PNG data URL
const FALLBACK_INDIGO_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA0SURBVDhPY/wPBAwUACYGhgdoGqBxfAbQ2f8ZqBiAGzDggxUwhiGQk1DcgB3QA+j4fxAGALi3F9kUoWfEAAAAAElFTkSuQmCC';

// Generate dynamic PNG icon data URL for 16, 48, 128 sizes for CouponSweep
export function createExtensionIconDataUrl(size: number): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return FALLBACK_INDIGO_PNG;

    const scale = size / 100;
    ctx.scale(scale, scale);

    // Modern Indigo Gradient simulation
    const grad = ctx.createLinearGradient(0, 0, 100, 100);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#4f46e5');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(50, 50, 48, 0, Math.PI * 2);
    ctx.fill();

    // Sweep / Checkmark
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(25, 65);
    ctx.lineTo(45, 75);
    ctx.lineTo(75, 35);
    ctx.stroke();

    // Sparkles
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(75, 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(85, 40, 2.5, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/png') || FALLBACK_INDIGO_PNG;
  } catch (e) {
    return FALLBACK_INDIGO_PNG;
  }
}

// Convert dataURL to Uint8Array for JSZip
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  try {
    const validUrl = dataUrl && dataUrl.includes(',') ? dataUrl : FALLBACK_INDIGO_PNG;
    const base64 = validUrl.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // minimal PNG header
  }
}

export async function buildExtensionZip(config: ExtensionConfig): Promise<Blob> {
  const zip = new JSZip();
  const files = generateExtensionFiles(config);

  // Add text files directly to root of the ZIP
  for (const file of files) {
    zip.file(file.path, file.content);
  }

  // Generate real PNG icon files in icons/ folder for CouponSweep.
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    const icon16Bytes = dataUrlToUint8Array(createExtensionIconDataUrl(16));
    const icon48Bytes = dataUrlToUint8Array(createExtensionIconDataUrl(48));
    const icon128Bytes = dataUrlToUint8Array(createExtensionIconDataUrl(128));

    iconsFolder.file('icon16.png', icon16Bytes);
    iconsFolder.file('icon48.png', icon48Bytes);
    iconsFolder.file('icon128.png', icon128Bytes);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}

export function triggerDownload(blob: Blob, filename = 'couponsweep-extension.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function triggerFileDownload(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
