// background.js — CareerTrack Job Clipper Service Worker
// Handles storage, alarms, deadline reminder notifications, and messaging.

'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────
const SCHEMA_VERSION = 1;
const DEFAULT_SETTINGS = {
  schemaVersion: SCHEMA_VERSION,
  reminderLeadHours: 24,
  notificationEnabled: true
};

// ─── Storage Helpers ──────────────────────────────────────────────────────────
async function getJobs() {
  const result = await chrome.storage.local.get('jobs');
  return result.jobs || [];
}

async function saveJobs(jobs) {
  await chrome.storage.local.set({ jobs });
}

async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  if (!result.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

// ─── ID Generation ────────────────────────────────────────────────────────────
function generateId() {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateJob(job) {
  if (!job.roleTitle || typeof job.roleTitle !== 'string' || !job.roleTitle.trim()) {
    return { valid: false, error: 'Role title is required' };
  }
  if (!job.companyName || typeof job.companyName !== 'string' || !job.companyName.trim()) {
    return { valid: false, error: 'Company name is required' };
  }
  const validStatuses = ['SAVED', 'APPLIED', 'INTERVIEW', 'RESULT'];
  if (job.status && !validStatuses.includes(job.status)) {
    return { valid: false, error: 'Invalid status' };
  }
  return { valid: true };
}

// ─── Alarm & Reminder Helpers ─────────────────────────────────────────────────
function computeReminderAt(job, settings) {
  if (!job.deadlineDate || !job.reminderEnabled) return null;
  // End of deadline day local time
  const deadline = new Date(job.deadlineDate + 'T23:59:00');
  const leadMs = (settings.reminderLeadHours || 24) * 3600 * 1000;
  const reminderMs = deadline.getTime() - leadMs;
  return new Date(reminderMs).toISOString();
}

async function scheduleReminder(job, settings) {
  if (!job.reminderEnabled || !job.deadlineDate || !job.reminderAt || job.status === 'RESULT') {
    return;
  }
  const reminderTime = new Date(job.reminderAt).getTime();
  if (reminderTime <= Date.now()) {
    return;
  }
  try {
    await chrome.alarms.create(job.id, { when: reminderTime });
  } catch (e) {
    console.warn('Failed to create alarm for', job.id, e);
  }
}

async function cancelReminder(jobId) {
  try {
    await chrome.alarms.clear(jobId);
  } catch (e) {
    console.warn('Failed to clear alarm for', jobId, e);
  }
}

// ─── CSV Export (RFC 4180 with UTF-8 BOM) ──────────────────────────────────────
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jobsToCSV(jobs) {
  const headers = [
    'ID', 'Role', 'Company', 'URL', 'Deadline Date', 'Deadline Raw Text',
    'Location', 'Employment Type', 'Source Site', 'Status', 'Result Outcome',
    'Date Applied', 'Notes', 'Captured At', 'Created At'
  ];

  const rows = jobs.map(j => [
    j.id,
    j.roleTitle,
    j.companyName,
    j.jobUrl,
    j.deadlineDate,
    j.deadlineRawText,
    j.location,
    j.employmentType,
    j.sourceSite,
    j.status,
    j.resultOutcome,
    j.dateApplied,
    j.notes,
    j.capturedAt,
    j.createdAt
  ].map(escapeCSV).join(','));

  const BOM = '\uFEFF';
  return BOM + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
}

// ─── Message Handler ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    console.error('Service worker message error:', err);
    sendResponse({ success: false, error: err.message });
  });
  return true; // Keep sendResponse active asynchronously
});

async function handleMessage(message, sender) {
  const { type, payload = {} } = message;

  switch (type) {
    case 'SAVE_JOB': {
      const settings = await getSettings();
      const jobs = await getJobs();
      const now = new Date().toISOString();

      const job = {
        id: generateId(),
        roleTitle: (payload.roleTitle || '').trim(),
        companyName: (payload.companyName || '').trim(),
        jobUrl: payload.jobUrl || '',
        deadlineDate: payload.deadlineDate || null,
        deadlineRawText: payload.deadlineRawText || '',
        location: payload.location || '',
        employmentType: payload.employmentType || '',
        sourceSite: payload.sourceSite || 'manual',
        capturedAt: now,
        status: payload.status || 'SAVED',
        resultOutcome: payload.resultOutcome || null,
        dateApplied: payload.dateApplied || (payload.status === 'APPLIED' ? now.split('T')[0] : null),
        notes: payload.notes || '',
        reminderEnabled: payload.reminderEnabled !== false,
        reminderAt: null,
        overdueNotified: false,
        createdAt: now,
        updatedAt: now
      };

      const validation = validateJob(job);
      if (!validation.valid) return { success: false, error: validation.error };

      job.reminderAt = computeReminderAt(job, settings);
      jobs.push(job);
      await saveJobs(jobs);
      await scheduleReminder(job, settings);

      return { success: true, job };
    }

    case 'GET_JOBS': {
      const jobs = await getJobs();
      return { success: true, jobs };
    }

    case 'UPDATE_JOB': {
      const jobs = await getJobs();
      const settings = await getSettings();
      const idx = jobs.findIndex(j => j.id === payload.id);
      if (idx === -1) return { success: false, error: 'Job not found' };

      const updated = {
        ...jobs[idx],
        ...payload,
        id: jobs[idx].id,
        createdAt: jobs[idx].createdAt,
        updatedAt: new Date().toISOString()
      };

      const validation = validateJob(updated);
      if (!validation.valid) return { success: false, error: validation.error };

      await cancelReminder(updated.id);
      updated.reminderAt = computeReminderAt(updated, settings);
      jobs[idx] = updated;
      await saveJobs(jobs);
      await scheduleReminder(updated, settings);

      return { success: true, job: updated };
    }

    case 'DELETE_JOB': {
      const jobs = await getJobs();
      const idx = jobs.findIndex(j => j.id === payload.id);
      if (idx === -1) return { success: false, error: 'Job not found' };

      await cancelReminder(payload.id);
      jobs.splice(idx, 1);
      await saveJobs(jobs);
      return { success: true };
    }

    case 'MOVE_JOB': {
      const jobs = await getJobs();
      const idx = jobs.findIndex(j => j.id === payload.id);
      if (idx === -1) return { success: false, error: 'Job not found' };

      jobs[idx].status = payload.status;
      jobs[idx].updatedAt = new Date().toISOString();

      if (payload.status === 'APPLIED' && !jobs[idx].dateApplied) {
        jobs[idx].dateApplied = new Date().toISOString().split('T')[0];
      }

      await saveJobs(jobs);
      return { success: true, job: jobs[idx] };
    }

    case 'EXPORT_CSV': {
      const jobs = await getJobs();
      const csv = jobsToCSV(jobs);
      return { success: true, csv };
    }

    case 'GET_SETTINGS': {
      const settings = await getSettings();
      return { success: true, settings };
    }

    case 'UPDATE_SETTINGS': {
      const current = await getSettings();
      const updated = { ...current, ...payload };
      await saveSettings(updated);

      // Re-schedule alarms with new lead time
      const jobs = await getJobs();
      for (const job of jobs) {
        await cancelReminder(job.id);
        job.reminderAt = computeReminderAt(job, updated);
        await scheduleReminder(job, updated);
      }
      await saveJobs(jobs);
      return { success: true, settings: updated };
    }

    case 'CLEAR_ALL_DATA': {
      const jobs = await getJobs();
      for (const job of jobs) {
        await cancelReminder(job.id);
      }
      await chrome.storage.local.clear();
      await saveSettings(DEFAULT_SETTINGS);
      return { success: true };
    }

    case 'GET_OVERDUE': {
      const jobs = await getJobs();
      const now = new Date();
      const overdue = jobs.filter(j => {
        if (j.status === 'RESULT') return false;
        if (!j.deadlineDate) return false;
        return new Date(j.deadlineDate + 'T23:59:59') < now;
      });
      return { success: true, overdue };
    }

    default:
      return { success: false, error: `Unknown message type: ${type}` };
  }
}

// ─── Alarm Listener (Deadline Reminders) ──────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const jobs = await getJobs();
  const job = jobs.find(j => j.id === alarm.name);
  if (!job || job.status === 'RESULT') return;

  const settings = await getSettings();
  if (!settings.notificationEnabled) return;

  const daysLeft = job.deadlineDate
    ? Math.ceil((new Date(job.deadlineDate + 'T23:59:59') - Date.now()) / 86400000)
    : null;

  const daysText = daysLeft !== null
    ? (daysLeft <= 0 ? 'Deadline is TODAY!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`)
    : '';

  chrome.notifications.create(`notif_${job.id}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `⏰ Deadline Reminder: ${job.roleTitle}`,
    message: `${job.companyName} — ${daysText}. Click to view your application board.`,
    priority: 2
  });
});

// ─── Notification Click Listener ──────────────────────────────────────────────
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('board.html') });
});

// ─── Startup & Installation Handlers ──────────────────────────────────────────
chrome.runtime.onStartup.addListener(async () => {
  await recheckRemindersOnStartup();
});

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  if (!settings.schemaVersion) {
    await saveSettings(DEFAULT_SETTINGS);
  }
  await recheckRemindersOnStartup();
});

// Re-registers alarms and detects overdue reminders if browser was closed
async function recheckRemindersOnStartup() {
  const jobs = await getJobs();
  const settings = await getSettings();
  const now = Date.now();
  let updatedAny = false;

  for (const job of jobs) {
    if (!job.reminderEnabled || !job.deadlineDate || job.status === 'RESULT') continue;

    const reminderTime = job.reminderAt ? new Date(job.reminderAt).getTime() : null;

    if (reminderTime && reminderTime > now) {
      await scheduleReminder(job, settings);
    } else {
      // Reminder was due while browser was closed!
      const deadlineEnd = new Date(job.deadlineDate + 'T23:59:59').getTime();
      if (deadlineEnd < now && !job.overdueNotified) {
        if (settings.notificationEnabled) {
          chrome.notifications.create(`overdue_${job.id}`, {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: `⚠ Overdue Deadline: ${job.roleTitle}`,
            message: `${job.companyName} deadline passed on ${job.deadlineDate}.`,
            priority: 2
          });
          job.overdueNotified = true;
          updatedAny = true;
        }
      }
    }
  }

  if (updatedAny) {
    await saveJobs(jobs);
  }
}