/**
 * Smart ID Photo Lab - Before / After Comparison Slider Module
 * Allows users to inspect compression quality loss side-by-side or via interactive split divider.
 */

export class ComparisonViewer {
  constructor(container) {
    this.container = container;
    this.originalUrl = null;
    this.compressedUrl = null;
    this.dividerPosition = 50; // percentage (0..100)
    this.isDragging = false;
    this._renderBase();
  }

  _renderBase() {
    this.container.innerHTML = `
      <div class="comp-wrapper" style="position:relative; width:100%; height:320px; overflow:hidden; border-radius:8px; background:#0f172a; user-select:none;">
        <!-- Original Layer (Underneath / Left) -->
        <div class="comp-layer comp-before" style="position:absolute; inset:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
          <img id="comp-img-before" src="" alt="Original cropped image" style="max-width:100%; max-height:100%; object-fit:contain; pointer-events:none;" />
          <span style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.7); color:#fff; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; border:1px solid rgba(255,255,255,0.2);">
            Original (Pre-compression)
          </span>
        </div>

        <!-- Compressed Layer (Clipped / Right) -->
        <div id="comp-after-clip" class="comp-layer comp-after" style="position:absolute; inset:0; width:100%; height:100%; clip-path:polygon(50% 0, 100% 0, 100% 100%, 50% 100%); display:flex; align-items:center; justify-content:center;">
          <img id="comp-img-after" src="" alt="Compressed output image" style="max-width:100%; max-height:100%; object-fit:contain; pointer-events:none;" />
          <span style="position:absolute; top:12px; right:12px; background:rgba(14,165,233,0.85); color:#fff; font-size:11px; padding:3px 8px; border-radius:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">
            Compressed Output
          </span>
        </div>

        <!-- Split Divider Handle Line -->
        <div id="comp-divider" style="position:absolute; top:0; bottom:0; left:50%; width:2px; background:#38bdf8; cursor:ew-resize; box-shadow:0 0 10px rgba(56,189,248,0.8); z-index:10; transform:translateX(-50%);">
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:32px; height:32px; border-radius:50%; background:#0284c7; border:2px solid #fff; display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; box-shadow:0 2px 8px rgba(0,0,0,0.5);">
            ⇄
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:12px; color:#94a3b8;">
        <span>Drag center divider ⇄ to compare clarity</span>
        <button type="button" id="comp-toggle-view" class="btn btn-sm btn-ghost" style="font-size:11px; padding:2px 8px;">
          Side-by-Side View
        </button>
      </div>
    `;

    this.beforeImg = this.container.querySelector('#comp-img-before');
    this.afterImg = this.container.querySelector('#comp-img-after');
    this.clipLayer = this.container.querySelector('#comp-after-clip');
    this.divider = this.container.querySelector('#comp-divider');
    this.wrapper = this.container.querySelector('.comp-wrapper');
    this.toggleBtn = this.container.querySelector('#comp-toggle-view');

    this.isSideBySide = false;
    this._bindEvents();
  }

  setImages(originalUrl, compressedUrl) {
    this.originalUrl = originalUrl;
    this.compressedUrl = compressedUrl;
    this.beforeImg.src = originalUrl;
    this.afterImg.src = compressedUrl;
    this.setDivider(50);
  }

  setDivider(percent) {
    this.dividerPosition = Math.max(0, Math.min(100, percent));
    if (!this.isSideBySide) {
      this.clipLayer.style.clipPath = `polygon(${this.dividerPosition}% 0, 100% 0, 100% 100%, ${this.dividerPosition}% 100%)`;
      this.divider.style.left = `${this.dividerPosition}%`;
    }
  }

  _bindEvents() {
    const onMove = (clientX) => {
      if (!this.isDragging || this.isSideBySide) return;
      const rect = this.wrapper.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      this.setDivider(pos);
    };

    this.divider.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', () => { this.isDragging = false; });

    this.divider.addEventListener('touchstart', (e) => {
      this.isDragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => { this.isDragging = false; });

    this.toggleBtn.addEventListener('click', () => {
      this.isSideBySide = !this.isSideBySide;
      if (this.isSideBySide) {
        this.toggleBtn.textContent = 'Split Slider View';
        this.clipLayer.style.clipPath = 'none';
        this.divider.style.display = 'none';
        this.wrapper.style.display = 'grid';
        this.wrapper.style.gridTemplateColumns = '1fr 1fr';
        this.wrapper.style.gap = '4px';
        this.container.querySelector('.comp-before').style.position = 'relative';
        this.clipLayer.style.position = 'relative';
      } else {
        this.toggleBtn.textContent = 'Side-by-Side View';
        this.wrapper.style.display = 'block';
        this.container.querySelector('.comp-before').style.position = 'absolute';
        this.clipLayer.style.position = 'absolute';
        this.divider.style.display = 'block';
        this.setDivider(50);
      }
    });
  }
}
