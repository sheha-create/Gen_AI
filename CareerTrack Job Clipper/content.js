// content.js — CareerTrack Job Clipper Content Script
// Extracts job details from supported job pages (LinkedIn, Indeed, Internshala)
// and handles JSON-LD JobPosting metadata fallback.

(function () {
  'use strict';

  // ─── Avoid duplicate injection ──────────────────────────────────────────────
  if (window.__careerTrackInjected) return;
  window.__careerTrackInjected = true;

  // ─── Detect current site ────────────────────────────────────────────────────
  function detectSite() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('indeed.com')) return 'indeed';
    if (host.includes('internshala.com')) return 'internshala';
    return 'unknown';
  }

  // ─── Date parser ────────────────────────────────────────────────────────────
  function parseDeadline(text) {
    if (!text) return null;
    const cleaned = text.replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim();

    // ISO format: YYYY-MM-DD
    const isoMatch = cleaned.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // Try standard date parsing (handles "28 Nov 2024", "Dec 31, 2024", etc.)
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      // Handle two-digit year parsed into 19xx
      if (year < 2000 && year >= 20) {
        d.setFullYear(2000 + year);
      }
      return d.toISOString().split('T')[0];
    }
    return null;
  }

  function safeText(selector, root) {
    root = root || document;
    try {
      const el = root.querySelector(selector);
      return el ? el.textContent.trim().replace(/\s+/g, ' ') : '';
    } catch (e) { return ''; }
  }

  // ─── JSON-LD extractor ──────────────────────────────────────────────────────
  function extractFromJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        const nodes = Array.isArray(data) ? data : (data['@graph'] ? data['@graph'] : [data]);
        for (const node of nodes) {
          if (node['@type'] === 'JobPosting') {
            const role = node.title || node.name || '';
            const company = (node.hiringOrganization && (node.hiringOrganization.name || node.hiringOrganization.legalName)) || '';
            let locStr = '';
            if (node.jobLocation) {
              const loc = Array.isArray(node.jobLocation) ? node.jobLocation[0] : node.jobLocation;
              if (typeof loc === 'string') locStr = loc;
              else if (loc.address) {
                const a = loc.address;
                locStr = [a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(', ');
              }
            }
            const empType = Array.isArray(node.employmentType) ? node.employmentType.join(', ') : (node.employmentType || '');
            const rawDeadline = node.validThrough || '';

            return {
              roleTitle: role,
              companyName: company,
              jobUrl: node.url || window.location.href,
              deadlineDate: parseDeadline(rawDeadline),
              deadlineRawText: rawDeadline,
              location: locStr,
              employmentType: empType,
              sourceSite: detectSite()
            };
          }
        }
      } catch (e) { /* skip malformed */ }
    }
    return null;
  }

  // ─── LinkedIn extractor ─────────────────────────────────────────────────────
  function extractLinkedIn() {
    const roleTitle =
      safeText('.top-card-layout__title') ||
      safeText('.job-details-jobs-unified-top-card__job-title') ||
      safeText('h1.t-24') ||
      safeText('h1[class*="job-title"]') ||
      safeText('h1');

    const companyName =
      safeText('.topcard__org-name-link') ||
      safeText('.topcard__org-name') ||
      safeText('a[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
      safeText('.job-details-jobs-unified-top-card__company-name') ||
      safeText('[class*="company-name"]');

    const locText =
      safeText('.topcard__flavor--bullet') ||
      safeText('.job-details-jobs-unified-top-card__primary-description-container span:first-child') ||
      safeText('[class*="job-details"][class*="location"]') ||
      '';

    let deadlineRawText = '';
    const criteriaItems = document.querySelectorAll('.description__job-criteria-item');
    for (const item of criteriaItems) {
      const header = item.querySelector('.description__job-criteria-subheader');
      if (header && /expir|deadline|apply by|closing/i.test(header.textContent)) {
        deadlineRawText = safeText('.description__job-criteria-text--criteria', item);
        break;
      }
    }

    let employmentType = '';
    for (const item of criteriaItems) {
      const h = item.querySelector('.description__job-criteria-subheader');
      if (h && /employment type/i.test(h.textContent)) {
        employmentType = safeText('.description__job-criteria-text--criteria', item);
        break;
      }
    }

    return {
      roleTitle,
      companyName,
      jobUrl: window.location.href,
      deadlineDate: parseDeadline(deadlineRawText),
      deadlineRawText,
      location: locText,
      employmentType,
      sourceSite: 'linkedin'
    };
  }

  // ─── Indeed extractor ───────────────────────────────────────────────────────
  function extractIndeed() {
    const roleTitle =
      safeText('[data-testid="jobsearch-JobInfoHeader-title"]') ||
      safeText('h1.jobsearch-JobInfoHeader-title') ||
      safeText('h1[class*="jobTitle"]') ||
      safeText('h2.jobTitle') ||
      safeText('h1');

    const companyName =
      safeText('[data-testid="inlineHeader-companyName"] a') ||
      safeText('[data-testid="inlineHeader-companyName"]') ||
      safeText('[data-company-name]') ||
      safeText('.jobsearch-CompanyInfoWithoutHeaderImage span') ||
      safeText('.companyName');

    const locText =
      safeText('[data-testid="job-location"]') ||
      safeText('[data-testid="inlineHeader-companyLocation"]') ||
      safeText('.jobsearch-JobInfoHeader-subtitle > div:last-child') ||
      safeText('.companyLocation') ||
      '';

    const deadlineRawText =
      safeText('[data-testid="job-expiration"]') ||
      safeText('[class*="expiration"]') ||
      '';

    const employmentType =
      safeText('[data-testid="jobType"]') ||
      safeText('#salaryInfoAndJobType') ||
      '';

    return {
      roleTitle,
      companyName,
      jobUrl: window.location.href,
      deadlineDate: parseDeadline(deadlineRawText),
      deadlineRawText,
      location: locText,
      employmentType,
      sourceSite: 'indeed'
    };
  }

  // ─── Internshala extractor ──────────────────────────────────────────────────
  function extractInternshala() {
    const roleTitle =
      safeText('.profile_on_detail_page') ||
      safeText('h1.heading_4_5') ||
      safeText('.internship_title') ||
      safeText('h1');

    const companyName =
      safeText('.company_name a') ||
      safeText('.company_name') ||
      safeText('[class*="company-name"]') ||
      safeText('.heading_6');

    const locText =
      safeText('#location_names a') ||
      safeText('.location_link') ||
      safeText('.internship_other_detail:has(.location) .detail_view') ||
      '';

    let deadlineRawText = '';
    const detailRows = document.querySelectorAll('.internship_other_details_container .item_body');
    const labels = document.querySelectorAll('.internship_other_details_container .item_heading');
    labels.forEach((label, i) => {
      if (/apply by|deadline|last date/i.test(label.textContent)) {
        deadlineRawText = detailRows[i] ? detailRows[i].textContent.trim() : '';
      }
    });

    if (!deadlineRawText) {
      const all = document.querySelectorAll('.other_detail_item');
      for (const item of all) {
        if (/apply by/i.test(item.textContent)) {
          deadlineRawText = item.textContent.replace(/apply by/i, '').trim();
          break;
        }
      }
    }

    const stipend =
      safeText('#stipend-value') ||
      safeText('.stipend_container .stipend') ||
      '';

    return {
      roleTitle,
      companyName,
      jobUrl: window.location.href,
      deadlineDate: parseDeadline(deadlineRawText),
      deadlineRawText,
      location: locText,
      employmentType: 'Internship',
      sourceSite: 'internshala',
      notes: stipend ? `Stipend: ${stipend}` : ''
    };
  }

  // ─── Main extraction ────────────────────────────────────────────────────────
  function extractJobData() {
    const jsonLdData = extractFromJsonLd();
    if (jsonLdData && jsonLdData.roleTitle && jsonLdData.companyName) {
      return jsonLdData;
    }

    const site = detectSite();
    let siteData = null;

    switch (site) {
      case 'linkedin': siteData = extractLinkedIn(); break;
      case 'indeed':   siteData = extractIndeed();   break;
      case 'internshala': siteData = extractInternshala(); break;
      default:
        siteData = {
          roleTitle: document.title.split(' - ')[0].trim(),
          companyName: '',
          jobUrl: window.location.href,
          deadlineDate: null,
          deadlineRawText: '',
          location: '',
          employmentType: '',
          sourceSite: 'unknown'
        };
    }

    if (jsonLdData) {
      return {
        roleTitle: siteData.roleTitle || jsonLdData.roleTitle,
        companyName: siteData.companyName || jsonLdData.companyName,
        jobUrl: siteData.jobUrl || jsonLdData.jobUrl || window.location.href,
        deadlineDate: siteData.deadlineDate || jsonLdData.deadlineDate,
        deadlineRawText: siteData.deadlineRawText || jsonLdData.deadlineRawText,
        location: siteData.location || jsonLdData.location,
        employmentType: siteData.employmentType || jsonLdData.employmentType,
        sourceSite: siteData.sourceSite,
        notes: siteData.notes || ''
      };
    }

    return { ...siteData, notes: siteData.notes || '' };
  }

  // ─── Message listener ───────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_JOB') {
      try {
        const data = extractJobData();
        sendResponse({ success: true, data });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    }
    return true;
  });

  // ─── Auto-extract and cache on page load ────────────────────────────────────
  try {
    const cachedJobData = extractJobData();
    sessionStorage.setItem('__careerTrack_job', JSON.stringify(cachedJobData));
  } catch (e) {
    // Ignore cache failure
  }

})();