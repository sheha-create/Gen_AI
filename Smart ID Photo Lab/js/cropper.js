/**
 * Smart ID Photo Lab - Interactive Canvas Cropper
 * High-performance, touch-friendly, aspect-ratio locked cropper with Face Guide Overlay.
 */

export class ImageCropper {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.options = Object.assign({
      aspectRatio: 1, // width / height
      targetWidth: 350,
      targetHeight: 350,
      showFaceGuide: true,
      faceGuideOpacity: 0.85,
      minCropSize: 40,
      onCropChange: null,
    }, options);

    this.image = null;
    this.imageLoaded = false;

    // Viewport transform (zoom, pan, rotation)
    this.rotation = 0; // degrees: 0, 90, 180, 270 or fine angle
    this.fineAngle = 0; // -45 to +45 deg fine tilt correction
    this.flipH = false;
    this.flipV = false;

    // Crop box in image space (or display space)
    // We maintain crop box in normalized coordinates (0..1) relative to display canvas bounds
    this.crop = {
      x: 50,
      y: 50,
      width: 200,
      height: 200
    };

    // Interaction state
    this.activeAction = null; // 'drag', 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
    this.dragStart = { x: 0, y: 0 };
    this.initialCrop = { x: 0, y: 0, width: 0, height: 0 };
    this.handleRadius = 8;

    this._bindEvents();
    this.resizeCanvas();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.max(300, Math.floor(rect.width));
    const displayHeight = Math.max(250, Math.min(520, Math.floor(window.innerHeight * 0.55)));

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  loadImage(imageSource) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.imageLoaded = true;
        this.resetTransform();
        this.initDefaultCrop();
        this.render();
        if (this.options.onCropChange) this.options.onCropChange();
        resolve(img);
      };
      img.onerror = (err) => {
        reject(new Error('Failed to load image. The file may be corrupt or an unsupported format.'));
      };
      img.src = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    });
  }

  resetTransform() {
    this.rotation = 0;
    this.fineAngle = 0;
    this.flipH = false;
    this.flipV = false;
  }

  setAspectRatio(ratio, targetWidth, targetHeight) {
    this.options.aspectRatio = ratio;
    if (targetWidth) this.options.targetWidth = targetWidth;
    if (targetHeight) this.options.targetHeight = targetHeight;
    this.initDefaultCrop();
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  setFaceGuideVisibility(visible) {
    this.options.showFaceGuide = !!visible;
    this.render();
  }

  setFaceGuideOpacity(opacity) {
    this.options.faceGuideOpacity = Math.max(0, Math.min(1, opacity));
    this.render();
  }

  rotate90(direction = 1) {
    this.rotation = (this.rotation + direction * 90 + 360) % 360;
    this.initDefaultCrop();
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  setFineAngle(angleDegrees) {
    this.fineAngle = Math.max(-45, Math.min(45, angleDegrees));
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  toggleFlipH() {
    this.flipH = !this.flipH;
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  toggleFlipV() {
    this.flipV = !this.flipV;
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  resetCrop() {
    this.resetTransform();
    this.initDefaultCrop();
    this.render();
    if (this.options.onCropChange) this.options.onCropChange();
  }

  /**
   * Compute image draw bounds and center on canvas
   */
  getImageBounds() {
    if (!this.image) return { x: 0, y: 0, w: 100, h: 100 };
    const rect = this.canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    const totalAngle = (this.rotation + this.fineAngle) * (Math.PI / 180);
    const cos = Math.abs(Math.cos(totalAngle));
    const sin = Math.abs(Math.sin(totalAngle));

    const imgW = this.image.naturalWidth || this.image.width;
    const imgH = this.image.naturalHeight || this.image.height;

    // Bounding box after rotation
    const rotW = imgW * cos + imgH * sin;
    const rotH = imgW * sin + imgH * cos;

    // Scale to fit canvas viewport with margins
    const margin = 20;
    const scale = Math.min((cw - margin * 2) / rotW, (ch - margin * 2) / rotH, 1.5);

    const dw = imgW * scale;
    const dh = imgH * scale;
    const cx = cw / 2;
    const cy = ch / 2;

    return {
      cx, cy,
      scale,
      dw, dh,
      imgW, imgH,
      cw, ch,
      totalAngle
    };
  }

  /**
   * Initializes the crop box centered within the image area
   */
  initDefaultCrop() {
    const bounds = this.getImageBounds();
    const ar = this.options.aspectRatio || 1;

    // We fit crop box inside available canvas space
    let cropH = Math.min(bounds.ch * 0.72, bounds.cw * 0.72 / ar);
    let cropW = cropH * ar;

    // If wider than canvas, constrain width
    if (cropW > bounds.cw * 0.8) {
      cropW = bounds.cw * 0.8;
      cropH = cropW / ar;
    }

    this.crop = {
      x: (bounds.cw - cropW) / 2,
      y: (bounds.ch - cropH) / 2,
      width: cropW,
      height: cropH
    };
  }

  _bindEvents() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.x,
        y: clientY - rect.y
      };
    };

    const handlePointerDown = (e) => {
      if (!this.imageLoaded) return;
      const pos = getPos(e);
      const action = this._detectHandle(pos.x, pos.y);
      if (action) {
        e.preventDefault();
        this.activeAction = action;
        this.dragStart = pos;
        this.initialCrop = { ...this.crop };
      }
    };

    const handlePointerMove = (e) => {
      if (!this.imageLoaded) return;
      const pos = getPos(e);

      if (!this.activeAction) {
        // Update cursor icon
        const handle = this._detectHandle(pos.x, pos.y);
        canvas.style.cursor = this._getCursorForHandle(handle);
        return;
      }

      e.preventDefault();
      const dx = pos.x - this.dragStart.x;
      const dy = pos.y - this.dragStart.y;
      this._applyDrag(dx, dy);
      this.render();
      if (this.options.onCropChange) this.options.onCropChange();
    };

    const handlePointerUp = () => {
      if (this.activeAction) {
        this.activeAction = null;
        if (this.options.onCropChange) this.options.onCropChange();
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);

    // Resize observer
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.resizeCanvas()).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  _detectHandle(x, y) {
    const c = this.crop;
    const r = this.handleRadius + 5; // tolerance

    // Check corners
    if (Math.hypot(x - c.x, y - c.y) <= r) return 'nw';
    if (Math.hypot(x - (c.x + c.width), y - c.y) <= r) return 'ne';
    if (Math.hypot(x - (c.x + c.width), y - (c.y + c.height)) <= r) return 'se';
    if (Math.hypot(x - c.x, y - (c.y + c.height)) <= r) return 'sw';

    // Check sides
    if (Math.hypot(x - (c.x + c.width / 2), y - c.y) <= r) return 'n';
    if (Math.hypot(x - (c.x + c.width / 2), y - (c.y + c.height)) <= r) return 's';
    if (Math.hypot(x - c.x, y - (c.y + c.height / 2)) <= r) return 'w';
    if (Math.hypot(x - (c.x + c.width), y - (c.y + c.height / 2)) <= r) return 'e';

    // Inside box
    if (x >= c.x && x <= c.x + c.width && y >= c.y && y <= c.y + c.height) {
      return 'drag';
    }

    return null;
  }

  _getCursorForHandle(handle) {
    switch (handle) {
      case 'nw': case 'se': return 'nwse-resize';
      case 'ne': case 'sw': return 'nesw-resize';
      case 'n': case 's': return 'ns-resize';
      case 'w': case 'e': return 'ew-resize';
      case 'drag': return 'grab';
      default: return 'default';
    }
  }

  _applyDrag(dx, dy) {
    const init = this.initialCrop;
    const ar = this.options.aspectRatio || 1;
    const minS = this.options.minCropSize;
    const bounds = this.getImageBounds();

    if (this.activeAction === 'drag') {
      let nx = init.x + dx;
      let ny = init.y + dy;

      // Constrain within display canvas
      nx = Math.max(0, Math.min(bounds.cw - init.width, nx));
      ny = Math.max(0, Math.min(bounds.ch - init.height, ny));

      this.crop.x = nx;
      this.crop.y = ny;
      return;
    }

    // Corner and edge resizing with aspect ratio preservation
    let nw = init.width;
    let nh = init.height;
    let nx = init.x;
    let ny = init.y;

    if (this.activeAction === 'se') {
      nw = Math.max(minS, init.width + dx);
      nh = nw / ar;
    } else if (this.activeAction === 'sw') {
      nw = Math.max(minS, init.width - dx);
      nh = nw / ar;
      nx = init.x + (init.width - nw);
    } else if (this.activeAction === 'ne') {
      nw = Math.max(minS, init.width + dx);
      nh = nw / ar;
      ny = init.y + (init.height - nh);
    } else if (this.activeAction === 'nw') {
      nw = Math.max(minS, init.width - dx);
      nh = nw / ar;
      nx = init.x + (init.width - nw);
      ny = init.y + (init.height - nh);
    } else if (this.activeAction === 'e' || this.activeAction === 'w') {
      const sign = this.activeAction === 'e' ? 1 : -1;
      nw = Math.max(minS, init.width + sign * dx);
      nh = nw / ar;
      if (this.activeAction === 'w') nx = init.x + (init.width - nw);
      ny = init.y + (init.height - nh) / 2; // expand symmetrically in Y
    } else if (this.activeAction === 's' || this.activeAction === 'n') {
      const sign = this.activeAction === 's' ? 1 : -1;
      nh = Math.max(minS, init.height + sign * dy);
      nw = nh * ar;
      if (this.activeAction === 'n') ny = init.y + (init.height - nh);
      nx = init.x + (init.width - nw) / 2; // expand symmetrically in X
    }

    // Boundary checks
    if (nx < 0) {
      nw += nx;
      nh = nw / ar;
      nx = 0;
    }
    if (ny < 0) {
      nh += ny;
      nw = nh * ar;
      ny = 0;
    }
    if (nx + nw > bounds.cw) {
      nw = bounds.cw - nx;
      nh = nw / ar;
    }
    if (ny + nh > bounds.ch) {
      nh = bounds.ch - ny;
      nw = nh * ar;
    }

    if (nw >= minS && nh >= minS / ar) {
      this.crop = { x: nx, y: ny, width: nw, height: nh };
    }
  }

  /**
   * Main render method for Canvas
   */
  render() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    ctx.clearRect(0, 0, cw, ch);

    if (!this.imageLoaded || !this.image) {
      // Empty placeholder
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a photograph to begin cropping', cw / 2, ch / 2);
      return;
    }

    const bounds = this.getImageBounds();

    // 1. Draw base image with rotation & flips
    ctx.save();
    ctx.translate(bounds.cx, bounds.cy);
    ctx.rotate(bounds.totalAngle);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.drawImage(
      this.image,
      -bounds.dw / 2,
      -bounds.dh / 2,
      bounds.dw,
      bounds.dh
    );
    ctx.restore();

    // 2. Draw dimming overlay outside crop box
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, cw, ch);
    ctx.rect(this.crop.x, this.crop.y, this.crop.width, this.crop.height);
    ctx.fill('evenodd');
    ctx.restore();

    // 3. Draw crop box border
    ctx.save();
    ctx.strokeStyle = '#38bdf8'; // Sky blue border
    ctx.lineWidth = 2;
    ctx.strokeRect(this.crop.x, this.crop.y, this.crop.width, this.crop.height);

    // 4. Draw rule-of-thirds grid lines lightly
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const thirdW = this.crop.width / 3;
    const thirdH = this.crop.height / 3;

    ctx.beginPath();
    // vertical grid lines
    ctx.moveTo(this.crop.x + thirdW, this.crop.y);
    ctx.lineTo(this.crop.x + thirdW, this.crop.y + this.crop.height);
    ctx.moveTo(this.crop.x + thirdW * 2, this.crop.y);
    ctx.lineTo(this.crop.x + thirdW * 2, this.crop.y + this.crop.height);
    // horizontal grid lines
    ctx.moveTo(this.crop.x, this.crop.y + thirdH);
    ctx.lineTo(this.crop.x + this.crop.width, this.crop.y + thirdH);
    ctx.moveTo(this.crop.x, this.crop.y + thirdH * 2);
    ctx.lineTo(this.crop.x + this.crop.width, this.crop.y + thirdH * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 5. Draw Face Position Guide Overlay if enabled
    if (this.options.showFaceGuide) {
      this._drawFaceGuide(ctx);
    }

    // 6. Draw resize handles
    this._drawHandles(ctx);
  }

  /**
   * Face Guide Overlay (Eye line, Crown of head, Chin line, Vertical center, Face oval)
   */
  _drawFaceGuide(ctx) {
    const c = this.crop;
    const opacity = this.options.faceGuideOpacity || 0.85;

    ctx.save();
    ctx.strokeStyle = `rgba(234, 179, 8, ${opacity})`; // Amber yellow guide
    ctx.fillStyle = `rgba(234, 179, 8, ${opacity})`;
    ctx.lineWidth = 1.5;

    // A. Vertical head-center line
    ctx.setLineDash([3, 3]);
    const centerX = c.x + c.width / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, c.y + c.height * 0.05);
    ctx.lineTo(centerX, c.y + c.height * 0.95);
    ctx.stroke();

    // B. Crown of Head line (~10% from top)
    const crownY = c.y + c.height * 0.12;
    ctx.beginPath();
    ctx.moveTo(c.x + c.width * 0.25, crownY);
    ctx.lineTo(c.x + c.width * 0.75, crownY);
    ctx.stroke();

    // C. Eye-Line (~42% from top / 58% from bottom)
    const eyeY = c.y + c.height * 0.42;
    ctx.beginPath();
    ctx.moveTo(c.x + c.width * 0.15, eyeY);
    ctx.lineTo(c.x + c.width * 0.85, eyeY);
    ctx.stroke();

    // Eye target marks (left & right pupil targets)
    const eyeSep = c.width * 0.18;
    const eyeR = 4;
    ctx.beginPath();
    ctx.arc(centerX - eyeSep, eyeY, eyeR, 0, Math.PI * 2);
    ctx.arc(centerX + eyeSep, eyeY, eyeR, 0, Math.PI * 2);
    ctx.stroke();

    // D. Chin Guide Line (~78% from top)
    const chinY = c.y + c.height * 0.78;
    ctx.beginPath();
    ctx.moveTo(c.x + c.width * 0.3, chinY);
    ctx.lineTo(c.x + c.width * 0.7, chinY);
    ctx.stroke();

    // E. Elliptical Face Silhouette (Head + Chin Contour)
    ctx.beginPath();
    const ovalW = c.width * 0.27;
    const ovalH = c.height * 0.34;
    const ovalCenterY = c.y + c.height * 0.45;
    ctx.ellipse(centerX, ovalCenterY, ovalW, ovalH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // F. Clear Labels inside guide
    ctx.setLineDash([]);
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Crown', c.x + c.width * 0.77, crownY + 3);
    ctx.fillText('Eye Level', c.x + c.width * 0.87, eyeY + 3);
    ctx.fillText('Chin', c.x + c.width * 0.72, chinY + 3);

    ctx.restore();
  }

  _drawHandles(ctx) {
    const c = this.crop;
    const r = this.handleRadius;
    const points = [
      { x: c.x, y: c.y }, // nw
      { x: c.x + c.width / 2, y: c.y }, // n
      { x: c.x + c.width, y: c.y }, // ne
      { x: c.x + c.width, y: c.y + c.height / 2 }, // e
      { x: c.x + c.width, y: c.y + c.height }, // se
      { x: c.x + c.width / 2, y: c.y + c.height }, // s
      { x: c.x, y: c.y + c.height }, // sw
      { x: c.x, y: c.y + c.height / 2 }, // w
    ];

    ctx.save();
    for (const pt of points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Export the cropped area rendered onto an off-screen canvas at exact target dimensions
   * @param {number} targetWidth
   * @param {number} targetHeight
   * @returns {HTMLCanvasElement}
   */
  getCroppedCanvas(targetWidth, targetHeight) {
    if (!this.imageLoaded || !this.image) return null;

    const outW = targetWidth || this.options.targetWidth;
    const outH = targetHeight || this.options.targetHeight;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');

    // Fill background with clean white by default
    outCtx.fillStyle = '#ffffff';
    outCtx.fillRect(0, 0, outW, outH);

    // Compute transformation from crop coordinate space back to original image
    const bounds = this.getImageBounds();
    const totalAngle = bounds.totalAngle;

    // We can render by creating an intermediate high-res transformed canvas
    const tempCanvas = document.createElement('canvas');
    const imgW = this.image.naturalWidth || this.image.width;
    const imgH = this.image.naturalHeight || this.image.height;

    // Bounding dimensions for rotated image
    const cos = Math.abs(Math.cos(totalAngle));
    const sin = Math.abs(Math.sin(totalAngle));
    const rotW = Math.ceil(imgW * cos + imgH * sin);
    const rotH = Math.ceil(imgW * sin + imgH * cos);

    tempCanvas.width = rotW;
    tempCanvas.height = rotH;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.save();
    tempCtx.translate(rotW / 2, rotH / 2);
    tempCtx.rotate(totalAngle);
    tempCtx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    tempCtx.drawImage(this.image, -imgW / 2, -imgH / 2, imgW, imgH);
    tempCtx.restore();

    // Now map the display crop box into the tempCanvas coordinate system
    // Display image was drawn at scale = bounds.scale, centered at bounds.cx, bounds.cy
    const dispRotW = rotW * bounds.scale;
    const dispRotH = rotH * bounds.scale;
    const dispLeft = bounds.cx - dispRotW / 2;
    const dispTop = bounds.cy - dispRotH / 2;

    const srcX = (this.crop.x - dispLeft) / bounds.scale;
    const srcY = (this.crop.y - dispTop) / bounds.scale;
    const srcW = this.crop.width / bounds.scale;
    const srcH = this.crop.height / bounds.scale;

    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';

    outCtx.drawImage(
      tempCanvas,
      srcX, srcY, srcW, srcH,
      0, 0, outW, outH
    );

    return outCanvas;
  }
}
