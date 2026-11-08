// popup.js — CareerTrack Job Clipper

(async function () {
  'use strict';

  // ─── DOM Elements ───────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const stateLoading  = $('state-loading');
  const stateNoJob    = $('state-no-job');
  const stateSaved    = $('state-saved');
  const statePreview  = $('state-preview');
  const stateSuccess  = $('state-success');

  let currentTabUrl = '';
  let currentSite = 'manual';
  let capturedRawDeadline = '';

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function showState(id) {
    [stateLoading, stateNoJob, stateSaved, statePreview, stateSuccess].forEach(el => {
      el.classList.toggle('hidden', el.id !== id);
    });
  }

  function msg(type, payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, payload: payload || {} }, res => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        resolve(res);
      });
    });
  }

  function openBoard(query) {
    const url = chrome.runtime.getURL(query ? `board.html?${query}` : 'board.html');
    chrome.tabs.create({ url });
    window.close();
  }

  function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── Footer Stats ────────────────────────────────────────────────────────────
  async function updateFooter() {
    try {
      const res = await msg('GET_JOBS');
      if (res.success) {
        const total = res.jobs.length;
        const inProgress = res.jobs.filter(j => j.status === 'APPLIED' || j.status === 'INTERVIEW').length;
        $('footer-count').textContent = `${total} job${total !== 1 ? 's' : ''} tracked · ${inProgress} in progress`;
      }
    } catch {
      $('footer-count').textContent = 'CareerTrack';
    }
  }

  // ─── Static Button Listeners ─────────────────────────────────────────────────
  $('btn-board').addEventListener('click', () => openBoard());
  $('btn-open-board-2').addEventListener('click', () => openBoard());
  $('btn-open-board-3').addEventListener('click', () => openBoard());
  $('btn-view-board').addEventListener('click', () => openBoard());
  $('btn-view-board-2').addEventListener('click', () => openBoard());

  // Manual entry toggle when detection fails
  $('btn-enter-manual').addEventListener('click', () => {
    populatePreviewForm({
      roleTitle: '',
      companyName: '',
      location: '',
      employmentType: '',
      deadlineDate: '',
      deadlineRawText: '',
      notes: '',
      sourceSite: 'manual'
    });
  });

  function populatePreviewForm(data) {
    showState('state-preview');
    currentSite = data.sourceSite || 'manual';
    capturedRawDeadline = data.deadlineRawText || '';

    const siteLabels = {
      linkedin: 'LinkedIn',
      indeed: 'Indeed',
      internshala: 'Internshala',
      manual: 'Manual Entry',
      unknown: 'Web Page'
    };
    $('site-badge').textContent = siteLabels[currentSite] || currentSite.toUpperCase();

    $('preview-role-input').value = data.roleTitle || '';
    $('preview-company-input').value = data.companyName || '';
    $('preview-location-input').value = data.location || '';
    $('preview-type-input').value = data.employmentType || '';
    $('deadline-input').value = data.deadlineDate || '';

    const rawEl = $('preview-deadline-raw');
    if (data.deadlineRawText && data.deadlineRawText !== data.deadlineDate) {
      rawEl.textContent = `Captured text: "${data.deadlineRawText}"`;
      rawEl.classList.remove('hidden');
    } else {
      rawEl.textContent = '';
      rawEl.classList.add('hidden');
    }

    $('notes-input').value = data.notes || '';
    $('reminder-chk').checked = true;

    // Focus on first empty required field
    if (!data.roleTitle) {
      setTimeout(() => $('preview-role-input').focus(), 50);
    } else if (!data.companyName) {
      setTimeout(() => $('preview-company-input').focus(), 50);
    }
  }

  // ─── Save Button Logic ───────────────────────────────────────────────────────
  $('btn-save').addEventListener('click', async () => {
    const errorEl = $('save-error');
    errorEl.classList.add('hidden');

    const roleTitle   = $('preview-role-input').value.trim();
    const companyName = $('preview-company-input').value.trim();

    if (!roleTitle) {
      errorEl.textContent = 'Role title is required.';
      errorEl.classList.remove('hidden');
      $('preview-role-input').focus();
      return;
    }
    if (!companyName) {
      errorEl.textContent = 'Company name is required.';
      errorEl.classList.remove('hidden');
      $('preview-company-input').focus();
      return;
    }

    $('btn-save').disabled = true;
    $('save-btn-text').textContent = 'Saving…';

    const payload = {
      roleTitle,
      companyName,
      jobUrl: currentTabUrl,
      deadlineDate: $('deadline-input').value || null,
      deadlineRawText: capturedRawDeadline,
      location: $('preview-location-input').value.trim(),
      employmentType: $('preview-type-input').value.trim(),
      sourceSite: currentSite || 'manual',
      notes: $('notes-input').value.trim(),
      reminderEnabled: $('reminder-chk').checked,
      status: 'SAVED'
    };

    try {
      const res = await msg('SAVE_JOB', payload);
      if (res.success) {
        showState('state-success');
        $('success-desc').textContent = `${roleTitle} at ${companyName}`;
        await updateFooter();
      } else {
        $('btn-save').disabled = false;
        $('save-btn-text').textContent = '📌 Save This Job';
        errorEl.textContent = res.error || 'Failed to save job.';
        errorEl.classList.remove('hidden');
      }
    } catch (e) {
      $('btn-save').disabled = false;
      $('save-btn-text').textContent = '📌 Save This Job';
      errorEl.textContent = e.message;
      errorEl.classList.remove('hidden');
    }
  });

  // ─── Main Flow ───────────────────────────────────────────────────────────────
  showState('state-loading');
  await updateFooter();

  let tab;
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tab = activeTab;
  } catch (e) {
    showState('state-no-job');
    return;
  }

  if (!tab || !tab.url) {
    showState('state-no-job');
    return;
  }

  currentTabUrl = tab.url;
  const isSupportedSite = /linkedin\.com|indeed\.com|internshala\.com/i.test(currentTabUrl);

  // Check if current URL is already saved
  try {
    const allJobsRes = await msg('GET_JOBS');
    if (allJobsRes.success) {
      const existing = allJobsRes.jobs.find(j => j.jobUrl && j.jobUrl === currentTabUrl);
      if (existing) {
        showState('state-saved');
        $('saved-job-info').innerHTML = `
          <strong>${escapeHtml(existing.roleTitle)}</strong>
          <span>${escapeHtml(existing.companyName)} · Status: ${existing.status}</span>
        `;
        return;
      }
    }
  } catch (e) {
    // Continue
  }

  if (!isSupportedSite) {
    // Not one of the 3 host domains, allow manual entry immediately
    showState('state-no-job');
    return;
  }

  // Ask content script to extract job
  let jobData = null;
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB' }, res => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        resolve(res);
      });
    });
    if (response && response.success && response.data) {
      jobData = response.data;
    }
  } catch (e) {
    // Content script not yet injected or frame issue
  }

  if (jobData && (jobData.roleTitle || jobData.companyName)) {
    // Detection succeeded! Populate preview
    populatePreviewForm(jobData);
  } else {
    // Detection didn't find clear job info
    showState('state-no-job');
  }

})();