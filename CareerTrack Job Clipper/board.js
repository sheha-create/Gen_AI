// board.js — CareerTrack Job Clipper Application Board
// Compliant with Chrome MV3 CSP (no inline event handlers)

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let allJobs = [];
let settings = { schemaVersion: 1, reminderLeadHours: 24, notificationEnabled: true };
let searchQuery = '';
let filterStatus = '';
let filterDeadline = '';
let draggedJobId = null;
let editingJobId = null;
let deleteJobId = null;

// ─── DOM Selector Helper ──────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Chrome Message Helper ────────────────────────────────────────────────────
function msg(type, payload) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload: payload || {} }, res => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve(res);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(isoDate + 'T00:00:00');
  return Math.round((d - now) / 86400000);
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Load Data & Initialize ───────────────────────────────────────────────────
async function loadAll() {
  try {
    const [jobsRes, settingsRes] = await Promise.all([
      msg('GET_JOBS'),
      msg('GET_SETTINGS')
    ]);
    if (jobsRes && jobsRes.success) allJobs = jobsRes.jobs;
    if (settingsRes && settingsRes.success) settings = settingsRes.settings;
  } catch (e) {
    console.error('Failed to load initial data:', e);
  }
  renderBoard();
  checkOverdue();
}

// ─── Filtering Logic ──────────────────────────────────────────────────────────
function getFilteredJobs() {
  const q = searchQuery.toLowerCase().trim();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + 7);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return allJobs.filter(j => {
    // Search query
    if (q) {
      const matchRole = j.roleTitle && j.roleTitle.toLowerCase().includes(q);
      const matchComp = j.companyName && j.companyName.toLowerCase().includes(q);
      const matchLoc  = j.location && j.location.toLowerCase().includes(q);
      if (!matchRole && !matchComp && !matchLoc) return false;
    }

    // Status filter
    if (filterStatus && j.status !== filterStatus) return false;

    // Deadline filter
    if (filterDeadline) {
      const days = daysUntil(j.deadlineDate);
      if (filterDeadline === 'overdue') {
        if (days === null || days >= 0 || j.status === 'RESULT') return false;
      } else if (filterDeadline === 'today') {
        if (days !== 0) return false;
      } else if (filterDeadline === 'week') {
        if (days === null || days < 0 || days > 7) return false;
      } else if (filterDeadline === 'month') {
        if (days === null || days < 0 || new Date(j.deadlineDate + 'T00:00:00') > endOfMonth) return false;
      } else if (filterDeadline === 'none') {
        if (j.deadlineDate) return false;
      }
    }

    return true;
  });
}

// ─── Render Kanban Board ──────────────────────────────────────────────────────
function renderBoard() {
  const cols = { SAVED: [], APPLIED: [], INTERVIEW: [], RESULT: [] };
  const filtered = getFilteredJobs();

  for (const job of filtered) {
    if (cols[job.status]) cols[job.status].push(job);
  }

  for (const [status, jobs] of Object.entries(cols)) {
    const container = $(`cards-${status}`);
    const countEl = $(`count-${status}`);
    const totalInStatus = allJobs.filter(j => j.status === status).length;
    if (countEl) countEl.textContent = totalInStatus;

    if (container) {
      container.innerHTML = '';
      for (const job of jobs) {
        container.appendChild(buildCard(job));
      }
    }
  }

  // Show or hide empty board placeholder
  const noJobs = allJobs.length === 0;
  $('empty-state').classList.toggle('hidden', !noJobs);
  $('board').classList.toggle('hidden', noJobs);
}

// ─── Build Job Card ───────────────────────────────────────────────────────────
function buildCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.dataset.id = job.id;

  const days = daysUntil(job.deadlineDate);
  const isOverdue = days !== null && days < 0 && job.status !== 'RESULT';
  const isSoon = days !== null && days >= 0 && days <= 3 && job.status !== 'RESULT';

  if (isOverdue) card.classList.add('overdue-card');

  // Deadline badge
  let deadlineTag = '';
  if (job.deadlineDate) {
    if (isOverdue) {
      deadlineTag = `<span class="tag tag-overdue">⚠ Overdue (${Math.abs(days)}d ago)</span>`;
    } else if (days === 0) {
      deadlineTag = `<span class="tag tag-soon">🔥 Due Today</span>`;
    } else if (isSoon) {
      deadlineTag = `<span class="tag tag-soon">⏰ ${days}d left</span>`;
    } else {
      deadlineTag = `<span class="tag tag-deadline">📅 ${formatDate(job.deadlineDate)}</span>`;
    }
  }

  // Result outcome badge
  let outcomeTag = '';
  if (job.status === 'RESULT' && job.resultOutcome) {
    const cls = { OFFER: 'tag-offer', REJECTED: 'tag-rejected', WITHDRAWN: 'tag-withdrawn', OTHER: 'tag-other' }[job.resultOutcome] || 'tag-other';
    const label = { OFFER: '🎉 Offer', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn', OTHER: 'Other' }[job.resultOutcome] || job.resultOutcome;
    outcomeTag = `<span class="tag ${cls}">${label}</span>`;
  }

  // Source site badge
  const siteTag = job.sourceSite && job.sourceSite !== 'unknown'
    ? `<span class="tag tag-site">${escapeHtml(job.sourceSite)}</span>` : '';

  // Employment type badge
  const typeTag = job.employmentType
    ? `<span class="tag tag-type">${escapeHtml(job.employmentType)}</span>` : '';

  // Location text
  const locHtml = job.location
    ? `<div class="card-location">📍 ${escapeHtml(job.location)}</div>` : '';

  // Move dropdown options (accessible keyboard/tap control)
  const statusOptions = ['SAVED', 'APPLIED', 'INTERVIEW', 'RESULT']
    .filter(s => s !== job.status)
    .map(s => `<option value="${s}">${s.charAt(0) + s.slice(1).toLowerCase()}</option>`)
    .join('');

  // Outcome selector for RESULT stage
  const outcomeSelectHtml = job.status === 'RESULT' ? `
    <div class="card-outcome-wrap">
      <select class="outcome-select" aria-label="Result outcome">
        <option value="">Select outcome…</option>
        <option value="OFFER" ${job.resultOutcome === 'OFFER' ? 'selected' : ''}>🎉 Offer</option>
        <option value="REJECTED" ${job.resultOutcome === 'REJECTED' ? 'selected' : ''}>Rejected</option>
        <option value="WITHDRAWN" ${job.resultOutcome === 'WITHDRAWN' ? 'selected' : ''}>Withdrawn</option>
        <option value="OTHER" ${job.resultOutcome === 'OTHER' ? 'selected' : ''}>Other</option>
      </select>
    </div>` : '';

  card.draggable = true;
  card.innerHTML = `
    <div class="card-top">
      <div class="card-role">${escapeHtml(job.roleTitle)}</div>
    </div>
    <div class="card-company">${escapeHtml(job.companyName)}</div>
    ${locHtml}
    <div class="card-tags">
      ${deadlineTag}${outcomeTag}${siteTag}${typeTag}
    </div>
    ${outcomeSelectHtml}
    <div class="card-actions">
      <button type="button" class="card-btn btn-edit" title="Edit Job Details">✏ Edit</button>
      <button type="button" class="card-btn card-btn--danger btn-delete" title="Delete Job">🗑</button>
      ${job.jobUrl ? `<button type="button" class="card-btn btn-url" title="Open Job Listing" data-url="${escapeHtml(job.jobUrl)}">🔗</button>` : ''}
      <div class="card-move-wrap">
        <select class="card-move-select" aria-label="Move card to column">
          <option value="">Move to…</option>
          ${statusOptions}
        </select>
      </div>
    </div>
  `;

  // Attach drag events
  card.addEventListener('dragstart', e => {
    draggedJobId = job.id;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', job.id);
  });

  card.addEventListener('dragend', () => {
    draggedJobId = null;
    card.classList.remove('dragging');
    document.querySelectorAll('.col').forEach(c => c.classList.remove('drag-over'));
  });

  // Attach listeners to interactive elements inside card
  const btnEdit = card.querySelector('.btn-edit');
  if (btnEdit) btnEdit.addEventListener('click', () => openJobModal(job.id));

  const btnDelete = card.querySelector('.btn-delete');
  if (btnDelete) btnDelete.addEventListener('click', () => confirmDelete(job.id));

  const btnUrl = card.querySelector('.btn-url');
  if (btnUrl) btnUrl.addEventListener('click', () => window.open(job.jobUrl, '_blank'));

  const selectMove = card.querySelector('.card-move-select');
  if (selectMove) {
    selectMove.addEventListener('change', e => {
      if (e.target.value) {
        moveJobTo(job.id, e.target.value);
      }
    });
  }

  const selectOutcome = card.querySelector('.outcome-select');
  if (selectOutcome) {
    selectOutcome.addEventListener('change', e => {
      updateOutcome(job.id, e.target.value);
    });
  }

  return card;
}

// ─── Setup Column Drag & Drop ─────────────────────────────────────────────────
document.querySelectorAll('.col').forEach(col => {
  col.addEventListener('dragover', e => {
    e.preventDefault();
    col.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  });

  col.addEventListener('dragleave', e => {
    if (!col.contains(e.relatedTarget)) {
      col.classList.remove('drag-over');
    }
  });

  col.addEventListener('drop', async e => {
    e.preventDefault();
    col.classList.remove('drag-over');
    const jobId = draggedJobId || e.dataTransfer.getData('text/plain');
    const targetStatus = col.dataset.status;
    if (jobId && targetStatus) {
      await moveJobTo(jobId, targetStatus);
    }
  });
});

// ─── Move Job ─────────────────────────────────────────────────────────────────
async function moveJobTo(jobId, newStatus) {
  if (!newStatus) return;
  const job = allJobs.find(j => j.id === jobId);
  if (!job || job.status === newStatus) return;

  try {
    const res = await msg('MOVE_JOB', { id: jobId, status: newStatus });
    if (res.success) {
      const idx = allJobs.findIndex(j => j.id === jobId);
      if (idx !== -1) allJobs[idx] = res.job;
      renderBoard();
      checkOverdue();
    }
  } catch (err) {
    console.error('Failed to move job:', err);
  }
}

// ─── Update Result Outcome ────────────────────────────────────────────────────
async function updateOutcome(jobId, outcome) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;
  try {
    const res = await msg('UPDATE_JOB', { ...job, resultOutcome: outcome || null });
    if (res.success) {
      const idx = allJobs.findIndex(j => j.id === jobId);
      if (idx !== -1) allJobs[idx] = res.job;
      renderBoard();
    }
  } catch (err) {
    console.error('Failed to update outcome:', err);
  }
}

// ─── Overdue Check & Badge ────────────────────────────────────────────────────
function checkOverdue() {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const overdue = allJobs.filter(j => {
    if (j.status === 'RESULT') return false;
    if (!j.deadlineDate) return false;
    return new Date(j.deadlineDate + 'T00:00:00') < now;
  });

  const badge = $('overdue-badge');
  if (overdue.length > 0) {
    badge.classList.remove('hidden');
    $('overdue-count').textContent = overdue.length;
  } else {
    badge.classList.add('hidden');
  }
}

// ─── Job Modal (Add & Edit) ───────────────────────────────────────────────────
function openJobModal(jobId) {
  editingJobId = jobId || null;
  const isEdit = !!editingJobId;
  $('modal-title').textContent = isEdit ? 'Edit Job' : 'Add Job';
  $('btn-submit-form').textContent = isEdit ? 'Update Job' : 'Save Job';

  // Reset form
  $('job-form').reset();
  $('form-error').classList.add('hidden');
  $('result-outcome-group').style.display = 'none';

  if (isEdit) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;
    $('f-role').value           = job.roleTitle || '';
    $('f-company').value        = job.companyName || '';
    $('f-url').value            = job.jobUrl || '';
    $('f-deadline').value       = job.deadlineDate || '';
    $('f-deadline-raw').value   = job.deadlineRawText || '';
    $('f-location').value       = job.location || '';
    $('f-type').value           = job.employmentType || '';
    $('f-status').value         = job.status || 'SAVED';
    $('f-outcome').value        = job.resultOutcome || '';
    $('f-date-applied').value   = job.dateApplied || '';
    $('f-source').value         = job.sourceSite || '';
    $('f-notes').value          = job.notes || '';
    $('f-reminder').checked     = job.reminderEnabled !== false;

    if (job.status === 'RESULT') {
      $('result-outcome-group').style.display = 'flex';
    }
  } else {
    // Default values for new job
    $('f-status').value = 'SAVED';
    $('f-reminder').checked = true;
  }

  updateReminderHint();
  $('job-modal').classList.remove('hidden');
  setTimeout(() => $('f-role').focus(), 50);
}

function closeJobModal() {
  $('job-modal').classList.add('hidden');
  editingJobId = null;
}

function updateReminderHint() {
  const lead = settings.reminderLeadHours || 24;
  $('reminder-hint').textContent = `Notification will trigger ${lead} hour${lead !== 1 ? 's' : ''} prior to deadline.`;
}

$('f-status').addEventListener('change', () => {
  const isResult = $('f-status').value === 'RESULT';
  $('result-outcome-group').style.display = isResult ? 'flex' : 'none';
});

$('job-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errorEl = $('form-error');
  errorEl.classList.add('hidden');

  const role    = $('f-role').value.trim();
  const company = $('f-company').value.trim();
  if (!role)    { showFormError('Role Title is required.'); return; }
  if (!company) { showFormError('Company Name is required.'); return; }

  const payload = {
    roleTitle:       role,
    companyName:     company,
    jobUrl:          $('f-url').value.trim(),
    deadlineDate:    $('f-deadline').value || null,
    deadlineRawText: $('f-deadline-raw').value.trim(),
    location:        $('f-location').value.trim(),
    employmentType:  $('f-type').value.trim(),
    status:          $('f-status').value,
    resultOutcome:   $('f-outcome').value || null,
    dateApplied:     $('f-date-applied').value || null,
    sourceSite:      $('f-source').value.trim(),
    notes:           $('f-notes').value.trim(),
    reminderEnabled: $('f-reminder').checked
  };

  $('btn-submit-form').disabled = true;
  $('btn-submit-form').textContent = 'Saving…';

  try {
    let res;
    if (editingJobId) {
      res = await msg('UPDATE_JOB', { id: editingJobId, ...payload });
      if (res.success) {
        const idx = allJobs.findIndex(j => j.id === editingJobId);
        if (idx !== -1) allJobs[idx] = res.job;
      }
    } else {
      res = await msg('SAVE_JOB', payload);
      if (res.success) allJobs.push(res.job);
    }

    if (res && res.success) {
      closeJobModal();
      renderBoard();
      checkOverdue();
    } else {
      showFormError((res && res.error) || 'Failed to save job.');
    }
  } catch (err) {
    showFormError(err.message);
  } finally {
    $('btn-submit-form').disabled = false;
    $('btn-submit-form').textContent = editingJobId ? 'Update Job' : 'Save Job';
  }
});

function showFormError(text) {
  const el = $('form-error');
  el.textContent = text;
  el.classList.remove('hidden');
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function confirmDelete(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;
  deleteJobId = jobId;
  $('confirm-text').textContent = `Are you sure you want to delete "${job.roleTitle}" at ${job.companyName}? This cannot be undone.`;
  $('confirm-modal').classList.remove('hidden');
}

$('btn-confirm-ok').addEventListener('click', async () => {
  if (!deleteJobId) return;
  try {
    const res = await msg('DELETE_JOB', { id: deleteJobId });
    if (res.success) {
      allJobs = allJobs.filter(j => j.id !== deleteJobId);
      renderBoard();
      checkOverdue();
    }
  } catch (err) {
    console.error('Delete failed:', err);
  }
  deleteJobId = null;
  $('confirm-modal').classList.add('hidden');
});

$('btn-confirm-cancel').addEventListener('click', () => {
  deleteJobId = null;
  $('confirm-modal').classList.add('hidden');
});
$('confirm-modal-close').addEventListener('click', () => {
  deleteJobId = null;
  $('confirm-modal').classList.add('hidden');
});

// ─── Settings Modal ───────────────────────────────────────────────────────────
$('btn-settings').addEventListener('click', openSettings);

async function openSettings() {
  try {
    const res = await msg('GET_SETTINGS');
    if (res && res.success) settings = res.settings;
  } catch (e) {}
  $('s-lead-hours').value = settings.reminderLeadHours || 24;
  updateNotifStatus();
  $('settings-modal').classList.remove('hidden');
}

function updateNotifStatus() {
  const el = $('notif-status');
  const reqBtn = $('btn-request-notif');
  if (typeof Notification === 'undefined') {
    el.textContent = 'Notification API not available';
    return;
  }
  const perm = Notification.permission;
  el.className = 'notif-status ' + (perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : '');
  if (perm === 'granted') {
    el.textContent = '✓ Notifications enabled';
    reqBtn.classList.add('hidden');
  } else if (perm === 'denied') {
    el.textContent = '✗ Notifications blocked (enable in Chrome site settings)';
    reqBtn.classList.add('hidden');
  } else {
    el.textContent = '⚠ Notification permission not granted yet';
    reqBtn.classList.remove('hidden');
  }
}

$('btn-request-notif').addEventListener('click', async () => {
  if (typeof Notification !== 'undefined') {
    await Notification.requestPermission();
    updateNotifStatus();
  }
});

$('btn-settings-save').addEventListener('click', async () => {
  const lead = parseInt($('s-lead-hours').value, 10);
  if (!lead || lead < 1) {
    alert('Please enter a valid lead time (minimum 1 hour).');
    return;
  }
  try {
    const res = await msg('UPDATE_SETTINGS', { reminderLeadHours: lead });
    if (res.success) {
      settings = res.settings;
      $('settings-modal').classList.add('hidden');
      updateReminderHint();
    }
  } catch (err) {
    alert('Failed to update settings: ' + err.message);
  }
});

$('btn-settings-cancel').addEventListener('click', () => $('settings-modal').classList.add('hidden'));
$('settings-close').addEventListener('click', () => $('settings-modal').classList.add('hidden'));

$('btn-export-settings').addEventListener('click', exportCsv);
$('btn-clear-data').addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear ALL saved jobs? This cannot be undone.')) return;
  try {
    const res = await msg('CLEAR_ALL_DATA');
    if (res.success) {
      allJobs = [];
      renderBoard();
      checkOverdue();
      $('settings-modal').classList.add('hidden');
    }
  } catch (err) {
    alert('Failed to clear data: ' + err.message);
  }
});

// ─── CSV Export ───────────────────────────────────────────────────────────────
$('btn-export').addEventListener('click', exportCsv);

async function exportCsv() {
  try {
    const res = await msg('EXPORT_CSV');
    if (res.success) {
      const today = new Date().toISOString().split('T')[0];
      const filename = `careertrack_jobs_${today}.csv`;
      downloadBlob(res.csv, filename, 'text/csv;charset=utf-8');
    }
  } catch (err) {
    alert('Failed to export CSV: ' + err.message);
  }
}

// ─── Search & Filters ─────────────────────────────────────────────────────────
$('search-input').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderBoard();
});

$('filter-status').addEventListener('change', e => {
  filterStatus = e.target.value;
  renderBoard();
});

$('filter-deadline').addEventListener('change', e => {
  filterDeadline = e.target.value;
  renderBoard();
});

$('overdue-badge').addEventListener('click', () => {
  $('filter-deadline').value = 'overdue';
  filterDeadline = 'overdue';
  renderBoard();
});

// ─── Modal Close Listeners ────────────────────────────────────────────────────
$('modal-close').addEventListener('click', closeJobModal);
$('btn-cancel-form').addEventListener('click', closeJobModal);
$('btn-add').addEventListener('click', () => openJobModal());
$('btn-empty-add').addEventListener('click', () => openJobModal());

$('job-modal').addEventListener('click', e => {
  if (e.target === $('job-modal')) closeJobModal();
});
$('confirm-modal').addEventListener('click', e => {
  if (e.target === $('confirm-modal')) {
    deleteJobId = null;
    $('confirm-modal').classList.add('hidden');
  }
});
$('settings-modal').addEventListener('click', e => {
  if (e.target === $('settings-modal')) $('settings-modal').classList.add('hidden');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!$('job-modal').classList.contains('hidden')) closeJobModal();
    if (!$('confirm-modal').classList.contains('hidden')) {
      deleteJobId = null;
      $('confirm-modal').classList.add('hidden');
    }
    if (!$('settings-modal').classList.contains('hidden')) $('settings-modal').classList.add('hidden');
  }
});

// ─── Check Query Parameters on Startup ────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('action') === 'add') {
  openJobModal();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadAll();