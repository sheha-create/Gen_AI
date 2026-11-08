/**
 * Smart ID Photo Lab - Main Application Controller (app.js)
 * Orchestrates all modules: presets, cropper, compressor, validator, signature, comparison.
 */

import { getAllPresets, getPresetById, saveCustomPreset, deleteCustomPreset, validateCustomPresetData } from './presets.js';
import { ImageCropper } from './cropper.js';
import { compressCanvasToTargetKB } from './compressor.js';
import { ComplianceValidator } from './validator.js';
import { SignatureProcessor } from './signature.js';
import { ComparisonViewer } from './comparison.js';

// ──────────── State ────────────
let currentPresetId = 'upsc_otr';
let currentPreset = null;

let photoOriginalMeta = null;   // { width, height, name, sizeKB }
let photoCompressResult = null; // from compressor
let photoBlobUrl = null;        // object URL for download
let photoCroppedUrl = null;     // pre-compression cropped URL

let sigCompressResult = null;
let sigBlobUrl = null;

// ──────────── DOM Refs ────────────
const $presetSelect = document.getElementById('preset-select');
const $btnDeleteCustom = document.getElementById('btn-delete-custom');

// Photo tab
const $photoDropzone = document.getElementById('photo-dropzone');
const $photoFileInput = document.getElementById('photo-file-input');
const $photoChip = document.getElementById('photo-chip');
const $photoChipName = document.getElementById('photo-chip-name');
const $photoChipMeta = document.getElementById('photo-chip-meta');
const $photoCropCanvas = document.getElementById('photo-crop-canvas');
const $photoFileStatus = document.getElementById('photo-file-status');

// Toolbar
const $btnRotateLeft = document.getElementById('btn-rotate-left');
const $btnRotateRight = document.getElementById('btn-rotate-right');
const $btnFlipH = document.getElementById('btn-flip-h');
const $btnResetCrop = document.getElementById('btn-reset-crop');
const $sliderFineAngle = document.getElementById('slider-fine-angle');
const $labelFineAngle = document.getElementById('label-fine-angle');
const $checkFaceGuide = document.getElementById('check-face-guide');

// Photo output stats
const $statOutputDims = document.getElementById('stat-output-dims');
const $statOutputKB = document.getElementById('stat-output-kb');
const $statOutputQuality = document.getElementById('stat-output-quality');
const $photoCompressBadge = document.getElementById('photo-compress-badge');
const $photoDownloadDetails = document.getElementById('photo-download-details');
const $btnDownloadPhoto = document.getElementById('btn-download-photo');

// Signature tab
const $sigDropzone = document.getElementById('sig-dropzone');
const $sigFileInput = document.getElementById('sig-file-input');
const $sigChip = document.getElementById('sig-chip');
const $sigChipName = document.getElementById('sig-chip-name');
const $sigChipMeta = document.getElementById('sig-chip-meta');
const $sigPreviewCanvas = document.getElementById('sig-preview-canvas');
const $sigFileStatus = document.getElementById('sig-file-status');

const $sliderSigContrast = document.getElementById('slider-sig-contrast');
const $checkSigThreshold = document.getElementById('check-sig-threshold');
const $btnSigInvert = document.getElementById('btn-sig-invert');
const $btnSigReset = document.getElementById('btn-sig-reset');

const $statSigDims = document.getElementById('stat-sig-dims');
const $statSigKB = document.getElementById('stat-sig-kb');
const $statSigLimit = document.getElementById('stat-sig-limit');
const $sigStatusBadge = document.getElementById('sig-status-badge');
const $sigOutputImg = document.getElementById('sig-output-img');
const $sigDownloadDetails = document.getElementById('sig-download-details');
const $btnDownloadSig = document.getElementById('btn-download-sig');

// Export tab
const $complianceRulesContainer = document.getElementById('compliance-rules-container');
const $masterComplianceBadge = document.getElementById('master-compliance-badge');
const $btnDownloadPhotoMaster = document.getElementById('btn-download-photo-master');
const $btnDownloadSigMaster = document.getElementById('btn-download-sig-master');
const $tilePhotoMetrics = document.getElementById('tile-photo-metrics');
const $tileSigMetrics = document.getElementById('tile-sig-metrics');

// Modal
const $modal = document.getElementById('custom-preset-modal');
const $customForm = document.getElementById('custom-preset-form');
const $customFormErrors = document.getElementById('custom-form-errors');

// ──────────── Modules ────────────
let cropper = null;
let sigProcessor = null;
let comparisonViewer = null;

// ──────────── Initialization ────────────
function init() {
  currentPreset = getPresetById(currentPresetId);
  populatePresetSelect();
  updatePresetSummaryUI();
  initCropper();
  initSignatureProcessor();
  initComparisonViewer();
  bindEvents();
  switchTab('tab-photo');
}

// ──────────── Preset Select ────────────
function populatePresetSelect() {
  const presets = getAllPresets();
  $presetSelect.innerHTML = '';

  // Group by category
  const groups = {};
  for (const p of presets) {
    const cat = p.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }

  for (const [cat, items] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = cat;
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      if (item.id === currentPresetId) opt.selected = true;
      optgroup.appendChild(opt);
    }
    $presetSelect.appendChild(optgroup);
  }
}

function updatePresetSummaryUI() {
  const p = currentPreset;
  document.getElementById('summary-photo-dims').textContent = `${p.photo.width} × ${p.photo.height} px`;
  const minLabel = p.photo.minKB ? `${p.photo.minKB} KB` : '0 KB';
  document.getElementById('summary-photo-kb').textContent = `${minLabel} – ${p.photo.maxKB} KB`;

  if (p.signature && p.signature.required) {
    document.getElementById('summary-sig-dims').textContent =
      `${p.signature.width} × ${p.signature.height} px (≤ ${p.signature.maxKB} KB)`;
  } else {
    document.getElementById('summary-sig-dims').textContent = 'Not required';
  }

  document.getElementById('summary-format').textContent =
    p.photo.extension.toUpperCase() + ` (.${p.photo.extension})`;

  const $link = document.getElementById('summary-source-link');
  if (p.officialSourceUrl) {
    $link.href = p.officialSourceUrl;
    $link.textContent = p.organization + ' ↗';
    $link.style.display = '';
  } else {
    $link.style.display = 'none';
  }

  document.getElementById('summary-date-checked').textContent =
    p.dateChecked ? `Last verified: ${p.dateChecked}` : '';

  document.getElementById('preset-guidelines-text').textContent =
    p.photo.backgroundRule || p.photo.guidelines || 'Follow official notification instructions.';

  document.getElementById('preset-desc').textContent = p.description || '';

  // Show delete button only for custom presets
  if (p.isCustom) {
    $btnDeleteCustom.classList.remove('hidden');
  } else {
    $btnDeleteCustom.classList.add('hidden');
  }
}

function onPresetChange() {
  currentPresetId = $presetSelect.value;
  currentPreset = getPresetById(currentPresetId);
  updatePresetSummaryUI();

  // Update cropper aspect ratio
  if (cropper) {
    cropper.setAspectRatio(
      currentPreset.photo.width / currentPreset.photo.height,
      currentPreset.photo.width,
      currentPreset.photo.height
    );
  }

  // Re-process if images are loaded
  if (cropper && cropper.imageLoaded) {
    processPhoto();
  }
  if (sigProcessor && sigProcessor.isLoaded) {
    processSignature();
  }
}

// ──────────── Cropper ────────────
function initCropper() {
  cropper = new ImageCropper($photoCropCanvas, {
    aspectRatio: currentPreset.photo.width / currentPreset.photo.height,
    targetWidth: currentPreset.photo.width,
    targetHeight: currentPreset.photo.height,
    showFaceGuide: true,
    onCropChange: debounce(processPhoto, 350)
  });
}

// ──────────── Signature Processor ────────────
function initSignatureProcessor() {
  sigProcessor = new SignatureProcessor($sigPreviewCanvas);
}

// ──────────── Comparison Viewer ────────────
function initComparisonViewer() {
  const container = document.getElementById('comparison-slider-container');
  comparisonViewer = new ComparisonViewer(container);
}

// ──────────── Photo Processing Pipeline ────────────
async function processPhoto() {
  if (!cropper || !cropper.imageLoaded) return;

  const tw = currentPreset.photo.width;
  const th = currentPreset.photo.height;

  // 1. Get cropped canvas at exact target dimensions
  const croppedCanvas = cropper.getCroppedCanvas(tw, th);
  if (!croppedCanvas) return;

  // Generate pre-compression URL for comparison viewer
  if (photoCroppedUrl) URL.revokeObjectURL(photoCroppedUrl);
  const croppedBlob = await canvasToBlobHelper(croppedCanvas, 'image/png', 1.0);
  photoCroppedUrl = URL.createObjectURL(croppedBlob);

  // 2. Compress to meet file size limits
  try {
    photoCompressResult = await compressCanvasToTargetKB(croppedCanvas, {
      maxKB: currentPreset.photo.maxKB,
      minKB: currentPreset.photo.minKB || 0,
      format: currentPreset.photo.format || 'image/jpeg'
    });
  } catch (err) {
    console.error('Compression error:', err);
    return;
  }

  // 3. Update blob URL for download
  if (photoBlobUrl) URL.revokeObjectURL(photoBlobUrl);
  photoBlobUrl = URL.createObjectURL(photoCompressResult.blob);

  // 4. Update UI stats
  $statOutputDims.textContent = `${tw} × ${th} px`;
  $statOutputKB.textContent = `${photoCompressResult.kb} KB`;
  $statOutputKB.className = 'stat-val ' + (photoCompressResult.meetsLimit ? 'text-success' : 'text-danger');
  $statOutputQuality.textContent = `${(photoCompressResult.quality * 100).toFixed(0)}%`;

  $photoCompressBadge.classList.remove('hidden');
  $photoCompressBadge.className = 'status-badge ' + (photoCompressResult.success ? 'pass' : 'fail');
  $photoCompressBadge.textContent = photoCompressResult.success ? '✓ Compressed' : '✕ Over Limit';

  $photoDownloadDetails.textContent = photoCompressResult.message;

  // Download links
  const ext = currentPreset.photo.extension || 'jpg';
  const fname = `${currentPreset.id}_photo.${ext}`;
  $btnDownloadPhoto.href = photoBlobUrl;
  $btnDownloadPhoto.download = fname;
  $btnDownloadPhotoMaster.href = photoBlobUrl;
  $btnDownloadPhotoMaster.download = fname;

  $tilePhotoMetrics.textContent = `${tw}×${th} px · ${photoCompressResult.kb} KB · ${ext.toUpperCase()}`;

  // 5. Update comparison viewer
  comparisonViewer.setImages(photoCroppedUrl, photoBlobUrl);

  // 6. Run compliance validation
  updateComplianceReport();
}

// ──────────── Signature Processing Pipeline ────────────
async function processSignature() {
  if (!sigProcessor || !sigProcessor.isLoaded) return;

  try {
    sigCompressResult = await sigProcessor.processAndCompress(currentPreset);
  } catch (err) {
    console.error('Signature compression error:', err);
    return;
  }

  if (!sigCompressResult) return;

  // Update blob URL
  if (sigBlobUrl) URL.revokeObjectURL(sigBlobUrl);
  sigBlobUrl = URL.createObjectURL(sigCompressResult.blob);

  // Stats
  const specs = currentPreset.signature;
  $statSigDims.textContent = `${specs.width} × ${specs.height} px`;
  $statSigKB.textContent = `${sigCompressResult.kb} KB`;
  $statSigKB.className = 'stat-val ' + (sigCompressResult.meetsLimit ? 'text-success' : 'text-danger');
  $statSigLimit.textContent = `≤ ${specs.maxKB} KB`;

  $sigStatusBadge.classList.remove('hidden');
  $sigStatusBadge.className = 'status-badge ' + (sigCompressResult.success ? 'pass' : 'fail');
  $sigStatusBadge.textContent = sigCompressResult.success ? '✓ Compliant' : '✕ Over Limit';

  $sigOutputImg.src = sigBlobUrl;

  const ext = specs.extension || 'jpg';
  const fname = `${currentPresetId}_signature.${ext}`;
  $btnDownloadSig.href = sigBlobUrl;
  $btnDownloadSig.download = fname;
  $btnDownloadSigMaster.href = sigBlobUrl;
  $btnDownloadSigMaster.download = fname;

  $sigDownloadDetails.textContent = sigCompressResult.message;
  $tileSigMetrics.textContent = `${specs.width}×${specs.height} px · ${sigCompressResult.kb} KB · ${ext.toUpperCase()}`;

  updateComplianceReport();
}

// ──────────── Compliance Report ────────────
function updateComplianceReport() {
  const rules = [];
  let photoReport = null;
  let sigReport = null;

  if (photoCompressResult) {
    photoReport = ComplianceValidator.validatePhoto(
      {
        dimensions: photoCompressResult.dimensions,
        kb: photoCompressResult.kb,
        bytes: photoCompressResult.bytes,
        format: currentPreset.photo.format
      },
      currentPreset,
      photoOriginalMeta
    );
    rules.push(...photoReport.rules);
  }

  if (sigCompressResult && currentPreset.signature && currentPreset.signature.required) {
    sigReport = ComplianceValidator.validateSignature(
      {
        dimensions: sigCompressResult.dimensions || { width: currentPreset.signature.width, height: currentPreset.signature.height },
        kb: sigCompressResult.kb,
        bytes: sigCompressResult.bytes,
        format: currentPreset.signature.format
      },
      currentPreset
    );
    rules.push(...sigReport.rules);
  }

  // Render rules table
  $complianceRulesContainer.innerHTML = '';

  if (rules.length === 0) {
    $complianceRulesContainer.innerHTML = `
      <div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">
        Upload a photo to generate the compliance report.
      </div>`;
    $masterComplianceBadge.className = 'status-badge warn';
    $masterComplianceBadge.textContent = 'Awaiting Input';
    return;
  }

  // Header row
  const headerRow = document.createElement('div');
  headerRow.className = 'rule-row';
  headerRow.style.fontWeight = '700';
  headerRow.style.color = 'var(--text-muted)';
  headerRow.style.fontSize = '0.75rem';
  headerRow.style.textTransform = 'uppercase';
  headerRow.style.letterSpacing = '0.04em';
  headerRow.innerHTML = `
    <span>Requirement</span>
    <span>Expected</span>
    <span>Actual</span>
    <span>Status</span>
  `;
  $complianceRulesContainer.appendChild(headerRow);

  for (const rule of rules) {
    const row = document.createElement('div');
    row.className = 'rule-row';

    const statusClass = rule.status === 'PASS' ? 'pass' : rule.status === 'WARNING' ? 'warn' : 'fail';
    const statusIcon = rule.status === 'PASS' ? '✓' : rule.status === 'WARNING' ? '⚠' : '✕';

    row.innerHTML = `
      <span class="rule-name" title="${escapeHtml(rule.details)}">${escapeHtml(rule.name)}</span>
      <span class="rule-required">${escapeHtml(rule.required)}</span>
      <span class="rule-actual">${escapeHtml(rule.actual)}</span>
      <span class="status-badge ${statusClass}" style="justify-self:center;">${statusIcon} ${rule.status}</span>
    `;
    $complianceRulesContainer.appendChild(row);
  }

  // Master badge
  const hasFail = rules.some(r => r.status === 'FAIL');
  const hasWarn = rules.some(r => r.status === 'WARNING');
  const passCount = rules.filter(r => r.status === 'PASS').length;

  if (hasFail) {
    $masterComplianceBadge.className = 'status-badge fail';
    $masterComplianceBadge.textContent = `FAIL: ${rules.length - passCount} issue(s)`;
  } else if (hasWarn) {
    $masterComplianceBadge.className = 'status-badge warn';
    $masterComplianceBadge.textContent = `WARNING: ${passCount}/${rules.length} passed`;
  } else {
    $masterComplianceBadge.className = 'status-badge pass';
    $masterComplianceBadge.textContent = `PASS: 100% Compliant (${passCount}/${rules.length})`;
  }
}

// ──────────── Tab Navigation ────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const pane = document.getElementById(tabId);
  if (pane) {
    pane.classList.remove('hidden');
    pane.classList.add('active');
  }

  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) btn.classList.add('active');

  if (tabId === 'tab-export') {
    updateComplianceReport();
  }
}

// ──────────── File Upload Handlers ────────────
function handlePhotoFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    photoOriginalMeta = {
      width: img.naturalWidth,
      height: img.naturalHeight,
      name: file.name,
      sizeKB: parseFloat((file.size / 1024).toFixed(1))
    };

    $photoDropzone.classList.add('hidden');
    $photoChip.classList.remove('hidden');
    $photoChipName.textContent = file.name;
    $photoChipMeta.textContent = `${img.naturalWidth}×${img.naturalHeight} px · ${photoOriginalMeta.sizeKB} KB`;
    $photoFileStatus.textContent = '✓ Loaded';
    $photoFileStatus.style.color = 'var(--status-pass)';

    cropper.loadImage(url);
  };
  img.src = url;
}

function handleSignatureFile(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    $sigDropzone.classList.add('hidden');
    $sigChip.classList.remove('hidden');
    $sigChipName.textContent = file.name;
    $sigChipMeta.textContent = `${img.naturalWidth}×${img.naturalHeight} px · ${(file.size / 1024).toFixed(1)} KB`;
    $sigFileStatus.textContent = '✓ Loaded';
    $sigFileStatus.style.color = 'var(--status-pass)';

    sigProcessor.loadImage(url).then(() => {
      processSignature();
    });
  };
  img.src = url;
}

// ──────────── Drag & Drop Helpers ────────────
function setupDropzone(dropzone, fileInput, handler) {
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handler(fileInput.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handler(e.dataTransfer.files[0]);
    }
  });
}

// ──────────── Custom Preset Modal ────────────
function openModal() {
  $modal.classList.add('open');
  $customFormErrors.classList.add('hidden');
  $customForm.reset();
  document.getElementById('cp-include-sig').checked = true;
  document.getElementById('cp-sig-fields').style.display = '';
}

function closeModal() {
  $modal.classList.remove('open');
}

function submitCustomPreset(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('cp-name').value,
    organization: document.getElementById('cp-org').value,
    sourceUrl: document.getElementById('cp-url').value,
    photoWidth: document.getElementById('cp-photo-w').value,
    photoHeight: document.getElementById('cp-photo-h').value,
    photoMaxKB: document.getElementById('cp-photo-maxkb').value,
    photoMinKB: document.getElementById('cp-photo-minkb').value,
    includeSignature: document.getElementById('cp-include-sig').checked,
    sigWidth: document.getElementById('cp-sig-w').value,
    sigHeight: document.getElementById('cp-sig-h').value,
    sigMaxKB: document.getElementById('cp-sig-maxkb').value,
    sigMinKB: document.getElementById('cp-sig-minkb').value,
  };

  const validation = validateCustomPresetData(formData);
  if (!validation.isValid) {
    $customFormErrors.classList.remove('hidden');
    $customFormErrors.textContent = validation.errors.join(' ');
    return;
  }

  try {
    const newPreset = saveCustomPreset(formData);
    currentPresetId = newPreset.id;
    currentPreset = newPreset;
    populatePresetSelect();
    updatePresetSummaryUI();
    closeModal();

    if (cropper) {
      cropper.setAspectRatio(
        currentPreset.photo.width / currentPreset.photo.height,
        currentPreset.photo.width,
        currentPreset.photo.height
      );
    }
  } catch (err) {
    $customFormErrors.classList.remove('hidden');
    $customFormErrors.textContent = err.message;
  }
}

function onDeleteCustomPreset() {
  if (!currentPreset || !currentPreset.isCustom) return;
  if (!confirm(`Delete custom preset "${currentPreset.name}"?`)) return;

  deleteCustomPreset(currentPresetId);
  currentPresetId = 'upsc_otr';
  currentPreset = getPresetById(currentPresetId);
  populatePresetSelect();
  updatePresetSummaryUI();
  onPresetChange();
}

// ──────────── Sample Data Loader ────────────
async function loadSampleData() {
  try {
    const photoResp = await fetch('assets/sample_images/sample_photo.jpg');
    const photoBlob = await photoResp.blob();
    const photoFile = new File([photoBlob], 'sample_photo.jpg', { type: 'image/jpeg' });
    handlePhotoFile(photoFile);
  } catch (err) {
    console.warn('Could not load sample photo:', err);
    // Try the larger one
    try {
      const photoResp = await fetch('assets/sample_images/large_phone_photo_12mp.jpg');
      const photoBlob = await photoResp.blob();
      const photoFile = new File([photoBlob], 'large_phone_photo_12mp.jpg', { type: 'image/jpeg' });
      handlePhotoFile(photoFile);
    } catch (e) {
      console.warn('No sample photos available:', e);
    }
  }

  try {
    const sigResp = await fetch('assets/sample_images/sample_signature.jpg');
    const sigBlob = await sigResp.blob();
    const sigFile = new File([sigBlob], 'sample_signature.jpg', { type: 'image/jpeg' });
    handleSignatureFile(sigFile);
  } catch (err) {
    console.warn('Could not load sample signature:', err);
  }
}

// ──────────── Reset All ────────────
function resetAll() {
  // Revoke object URLs
  if (photoBlobUrl) URL.revokeObjectURL(photoBlobUrl);
  if (photoCroppedUrl) URL.revokeObjectURL(photoCroppedUrl);
  if (sigBlobUrl) URL.revokeObjectURL(sigBlobUrl);

  photoBlobUrl = null;
  photoCroppedUrl = null;
  sigBlobUrl = null;
  photoOriginalMeta = null;
  photoCompressResult = null;
  sigCompressResult = null;

  // Reset photo UI
  $photoDropzone.classList.remove('hidden');
  $photoChip.classList.add('hidden');
  $photoFileStatus.textContent = 'Awaiting Upload';
  $photoFileStatus.style.color = '';
  $photoFileInput.value = '';
  $statOutputDims.textContent = '---';
  $statOutputKB.textContent = '--- KB';
  $statOutputKB.className = 'stat-val';
  $statOutputQuality.textContent = '---';
  $photoCompressBadge.classList.add('hidden');
  $btnDownloadPhoto.removeAttribute('href');
  $btnDownloadPhotoMaster.removeAttribute('href');

  // Reset signature UI
  $sigDropzone.classList.remove('hidden');
  $sigChip.classList.add('hidden');
  $sigFileStatus.textContent = 'Awaiting Upload';
  $sigFileStatus.style.color = '';
  $sigFileInput.value = '';
  $statSigDims.textContent = '---';
  $statSigKB.textContent = '--- KB';
  $statSigKB.className = 'stat-val';
  $statSigLimit.textContent = '--- KB';
  $sigStatusBadge.classList.add('hidden');
  $sigOutputImg.src = '';
  $btnDownloadSig.removeAttribute('href');
  $btnDownloadSigMaster.removeAttribute('href');

  // Reset cropper
  if (cropper) {
    cropper.image = null;
    cropper.imageLoaded = false;
    cropper.resetTransform();
    cropper.render();
  }

  // Reset signature processor
  if (sigProcessor) {
    sigProcessor.image = null;
    sigProcessor.isLoaded = false;
    sigProcessor.contrastLevel = 1.2;
    sigProcessor.brightnessLevel = 10;
    sigProcessor.thresholdMode = false;
    sigProcessor.inverted = false;
  }

  // Reset slider
  $sliderFineAngle.value = 0;
  $labelFineAngle.textContent = '0°';
  $sliderSigContrast.value = 1.2;
  $checkSigThreshold.checked = false;

  // Reset compliance
  updateComplianceReport();

  switchTab('tab-photo');
}

// ──────────── Bind All Events ────────────
function bindEvents() {
  // Preset selection
  $presetSelect.addEventListener('change', onPresetChange);

  // Photo dropzone
  setupDropzone($photoDropzone, $photoFileInput, handlePhotoFile);
  document.getElementById('photo-btn-change').addEventListener('click', () => {
    $photoFileInput.click();
  });

  // Signature dropzone
  setupDropzone($sigDropzone, $sigFileInput, handleSignatureFile);
  document.getElementById('sig-btn-change').addEventListener('click', () => {
    $sigFileInput.click();
  });

  // Photo toolbar
  $btnRotateLeft.addEventListener('click', () => cropper.rotate90(-1));
  $btnRotateRight.addEventListener('click', () => cropper.rotate90(1));
  $btnFlipH.addEventListener('click', () => cropper.toggleFlipH());
  $btnResetCrop.addEventListener('click', () => {
    $sliderFineAngle.value = 0;
    $labelFineAngle.textContent = '0°';
    cropper.resetCrop();
  });

  $sliderFineAngle.addEventListener('input', () => {
    const val = parseFloat($sliderFineAngle.value);
    $labelFineAngle.textContent = `${val >= 0 ? '+' : ''}${val}°`;
    cropper.setFineAngle(val);
  });

  $checkFaceGuide.addEventListener('change', () => {
    cropper.setFaceGuideVisibility($checkFaceGuide.checked);
  });

  // Signature toolbar
  $sliderSigContrast.addEventListener('input', () => {
    sigProcessor.setFilters({
      contrast: parseFloat($sliderSigContrast.value),
      brightness: 10,
      threshold: $checkSigThreshold.checked,
      invert: sigProcessor.inverted
    });
    debounce(processSignature, 300)();
  });

  $checkSigThreshold.addEventListener('change', () => {
    sigProcessor.setFilters({
      contrast: parseFloat($sliderSigContrast.value),
      brightness: 10,
      threshold: $checkSigThreshold.checked,
      invert: sigProcessor.inverted
    });
    processSignature();
  });

  $btnSigInvert.addEventListener('click', () => {
    sigProcessor.setFilters({
      contrast: parseFloat($sliderSigContrast.value),
      brightness: 10,
      threshold: $checkSigThreshold.checked,
      invert: !sigProcessor.inverted
    });
    processSignature();
  });

  $btnSigReset.addEventListener('click', () => {
    $sliderSigContrast.value = 1.2;
    $checkSigThreshold.checked = false;
    sigProcessor.setFilters({
      contrast: 1.2,
      brightness: 10,
      threshold: false,
      invert: false
    });
    processSignature();
  });

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Navigation shortcuts
  document.getElementById('btn-goto-sig').addEventListener('click', () => switchTab('tab-sig'));
  document.getElementById('btn-back-photo').addEventListener('click', () => switchTab('tab-photo'));
  document.getElementById('btn-goto-export').addEventListener('click', () => switchTab('tab-export'));

  // Custom preset modal
  document.getElementById('btn-open-custom-modal').addEventListener('click', openModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-custom').addEventListener('click', closeModal);
  $customForm.addEventListener('submit', submitCustomPreset);
  $btnDeleteCustom.addEventListener('click', onDeleteCustomPreset);

  document.getElementById('cp-include-sig').addEventListener('change', (e) => {
    document.getElementById('cp-sig-fields').style.display = e.target.checked ? '' : 'none';
  });

  // Close modal on overlay click
  $modal.addEventListener('click', (e) => {
    if (e.target === $modal) closeModal();
  });

  // Sample data
  document.getElementById('btn-load-sample').addEventListener('click', loadSampleData);

  // Reset all
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Reset everything? All uploads and edits will be cleared.')) {
      resetAll();
    }
  });
}

// ──────────── Utilities ────────────
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function canvasToBlobHelper(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

// ──────────── Launch ────────────
document.addEventListener('DOMContentLoaded', init);
