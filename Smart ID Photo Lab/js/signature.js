/**
 * Smart ID Photo Lab - Dedicated Signature Processing Module
 * Handles signature upload, cropping, contrast enhancement, background whitening, and compression.
 */

import { compressCanvasToTargetKB } from './compressor.js';

export class SignatureProcessor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = null;
    this.isLoaded = false;
    this.contrastLevel = 1.2; // default boost
    this.brightnessLevel = 10; // slightly brighten background
    this.thresholdMode = false; // ink cleanup
    this.inverted = false;
  }

  loadImage(fileOrUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.isLoaded = true;
        this.render();
        resolve(img);
      };
      img.onerror = () => reject(new Error('Failed to load signature file.'));
      img.src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    });
  }

  setFilters({ contrast = 1.2, brightness = 10, threshold = false, invert = false }) {
    this.contrastLevel = contrast;
    this.brightnessLevel = brightness;
    this.thresholdMode = threshold;
    this.inverted = invert;
    this.render();
  }

  render() {
    if (!this.isLoaded || !this.image) return;

    const canvas = this.canvas;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Draw scaled aspect fit
    const imgW = this.image.naturalWidth || this.image.width;
    const imgH = this.image.naturalHeight || this.image.height;
    const scale = Math.min((w * 0.9) / imgW, (h * 0.9) / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.drawImage(this.image, dx, dy, dw, dh);

    // Apply pixel-level paper cleanup / contrast enhancement
    if (this.contrastLevel !== 1 || this.brightnessLevel !== 0 || this.thresholdMode) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Greyscale luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (this.thresholdMode) {
          // Clean threshold: turn shadows/paper light grey into pure white (255)
          // and ink into rich black (0)
          const val = lum < 165 ? Math.max(0, lum * 0.7) : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        } else {
          // Contrast + Brightness adjustment
          let factor = (259 * (this.contrastLevel * 100 + 255)) / (255 * (259 - this.contrastLevel * 100));
          let nr = factor * (r - 128) + 128 + this.brightnessLevel;
          let ng = factor * (g - 128) + 128 + this.brightnessLevel;
          let nb = factor * (b - 128) + 128 + this.brightnessLevel;

          data[i] = Math.min(255, Math.max(0, nr));
          data[i + 1] = Math.min(255, Math.max(0, ng));
          data[i + 2] = Math.min(255, Math.max(0, nb));
        }

        if (this.inverted) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }
  }

  /**
   * Export prepared signature canvas at exact preset dimensions
   */
  getExportCanvas(targetW, targetH) {
    if (!this.isLoaded || !this.image) return null;

    const out = document.createElement('canvas');
    out.width = targetW;
    out.height = targetH;
    const ctx = out.getContext('2d');

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Render scaled to target aspect ratio
    const imgW = this.image.naturalWidth || this.image.width;
    const imgH = this.image.naturalHeight || this.image.height;
    const scale = Math.min((targetW * 0.92) / imgW, (targetH * 0.92) / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (targetW - dw) / 2;
    const dy = (targetH - dh) / 2;

    ctx.drawImage(this.image, dx, dy, dw, dh);

    // Run identical enhancement
    if (this.contrastLevel !== 1 || this.brightnessLevel !== 0 || this.thresholdMode) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (this.thresholdMode) {
          const val = lum < 165 ? Math.max(0, lum * 0.7) : 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        } else {
          let factor = (259 * (this.contrastLevel * 100 + 255)) / (255 * (259 - this.contrastLevel * 100));
          let nr = factor * (r - 128) + 128 + this.brightnessLevel;
          let ng = factor * (g - 128) + 128 + this.brightnessLevel;
          let nb = factor * (b - 128) + 128 + this.brightnessLevel;

          data[i] = Math.min(255, Math.max(0, nr));
          data[i + 1] = Math.min(255, Math.max(0, ng));
          data[i + 2] = Math.min(255, Math.max(0, nb));
        }

        if (this.inverted) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    return out;
  }

  /**
   * Process & compress signature for current preset
   */
  async processAndCompress(preset) {
    if (!this.isLoaded) return null;
    const sigSpecs = preset.signature;
    const exportCanvas = this.getExportCanvas(sigSpecs.width, sigSpecs.height);

    const result = await compressCanvasToTargetKB(exportCanvas, {
      maxKB: sigSpecs.maxKB,
      minKB: sigSpecs.minKB || 0,
      format: sigSpecs.format || 'image/jpeg'
    });

    return {
      ...result,
      targetWidth: sigSpecs.width,
      targetHeight: sigSpecs.height
    };
  }
}
