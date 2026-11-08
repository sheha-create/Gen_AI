import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateResumeData } from '../src/utils/validation.ts';
import { calculateResumeCompleteness, estimatePageOverflow } from '../src/utils/pageCalculator.ts';
import { analyzeJobDescriptionMatch, extractAllResumeText } from '../src/utils/atsMatcher.ts';
import { findWeakPhrasesInText, ACTION_VERBS, WEAK_PHRASES } from '../src/utils/actionVerbs.ts';
import { SAMPLE_RESUME, EMPTY_RESUME } from '../src/data/sampleData.ts';

describe('Resume Data Validation (T-06, T-07, T-08)', () => {
  it('validates a pristine sample resume successfully', () => {
    const res = validateResumeData(SAMPLE_RESUME);
    assert.strictEqual(res.isValid, true);
    assert.ok(res.data);
    assert.strictEqual(res.data.profile.fullName, 'Alex Morgan');
    assert.strictEqual(res.data.settings.selectedTemplate, 'modern');
  });

  it('rejects null or non-object input (T-08)', () => {
    const res = validateResumeData(null);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /not a valid JSON object/i);
  });

  it('rejects missing schemaVersion (T-08)', () => {
    const malformed = { ...SAMPLE_RESUME, schemaVersion: undefined };
    const res = validateResumeData(malformed);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /schemaVersion/i);
  });

  it('rejects unsupported major schema version (T-08)', () => {
    const malformed = { ...SAMPLE_RESUME, schemaVersion: '99.0.0' };
    const res = validateResumeData(malformed);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /unsupported schema version/i);
  });

  it('rejects missing profile section (T-08)', () => {
    const malformed = { schemaVersion: '1.0.0', profile: null };
    const res = validateResumeData(malformed);
    assert.strictEqual(res.isValid, false);
    assert.match(res.error, /missing the required "profile"/i);
  });

  it('ensures all section keys are preserved even if imported file had missing ones', () => {
    const candidate = {
      ...SAMPLE_RESUME,
      settings: {
        ...SAMPLE_RESUME.settings,
        sectionOrder: ['experience', 'education'] // truncated order
      }
    };
    const res = validateResumeData(candidate);
    assert.strictEqual(res.isValid, true);
    assert.ok(res.data);
    // Should have all 7 sections
    assert.strictEqual(res.data.settings.sectionOrder.length, 7);
    assert.strictEqual(res.data.settings.sectionOrder[0], 'experience');
    assert.strictEqual(res.data.settings.sectionOrder[1], 'education');
  });
});

describe('Resume Completeness Calculator (FR-09)', () => {
  it('computes 100% completeness for sample resume', () => {
    const report = calculateResumeCompleteness(SAMPLE_RESUME);
    assert.strictEqual(report.score, 100);
    assert.strictEqual(report.missingCount, 0);
  });

  it('computes 0% completeness for empty resume', () => {
    const report = calculateResumeCompleteness(EMPTY_RESUME);
    assert.strictEqual(report.score, 0);
    assert.ok(report.missingCount > 0);
  });

  it('increases completeness incrementally as fields are added', () => {
    const partiallyFilled = {
      ...EMPTY_RESUME,
      profile: {
        ...EMPTY_RESUME.profile,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890'
      }
    };
    const report = calculateResumeCompleteness(partiallyFilled);
    assert.ok(report.score > 0);
    assert.ok(report.score < 100);
  });
});

describe('Page Overflow & Boundary Estimation (FR-08, T-04)', () => {
  it('estimates 1 page for standard content height', () => {
    const est = estimatePageOverflow(900);
    assert.strictEqual(est.estimatedPages, 1);
    assert.strictEqual(est.hasOverflowRisk, false);
  });

  it('estimates 2 pages for multi-page content flow', () => {
    const est = estimatePageOverflow(1800);
    assert.strictEqual(est.estimatedPages, 2);
  });

  it('flags overflow risk when content approaches page boundary threshold', () => {
    // A4_PAGE_HEIGHT_PX is 1123px; height 1080px is close to boundary
    const est = estimatePageOverflow(1080);
    assert.strictEqual(est.hasOverflowRisk, true);
  });
});

describe('Local ATS & Keyword Matcher (FR-10)', () => {
  it('matches common keywords between job description and resume corpus', () => {
    const job = 'We are seeking a Senior Full Stack Engineer with experience in React, TypeScript, Kubernetes, and PostgreSQL.';
    const analysis = analyzeJobDescriptionMatch(job, SAMPLE_RESUME);
    assert.ok(analysis.totalKeywordsCount > 0);
    assert.ok(analysis.matchPercentage > 50);
    assert.ok(analysis.matchedKeywords.some(k => k.keyword === 'react'));
    assert.ok(analysis.matchedKeywords.some(k => k.keyword === 'typescript'));
  });

  it('identifies missing keywords not present in resume', () => {
    const job = 'Looking for expertise in COBOL and Fortran legacy architectures.';
    const analysis = analyzeJobDescriptionMatch(job, SAMPLE_RESUME);
    assert.ok(analysis.missingKeywords.some(k => k.keyword === 'cobol'));
    assert.ok(analysis.missingKeywords.some(k => k.keyword === 'fortran'));
  });

  it('handles empty job description gracefully', () => {
    const analysis = analyzeJobDescriptionMatch('', SAMPLE_RESUME);
    assert.strictEqual(analysis.matchPercentage, 0);
    assert.strictEqual(analysis.totalKeywordsCount, 0);
  });
});

describe('Action Verbs and Phrasing Coach', () => {
  it('detects weak passive phrases like "Responsible for"', () => {
    const text = 'Responsible for developing the payment API and helped with customer support.';
    const weak = findWeakPhrasesInText(text);
    assert.strictEqual(weak.length, 2);
    assert.strictEqual(weak[0].phrase, 'Responsible for');
    assert.strictEqual(weak[1].phrase, 'Helped with');
  });

  it('provides constructive replacement alternatives without fabricating achievements', () => {
    const text = 'Worked on the authentication system.';
    const weak = findWeakPhrasesInText(text);
    assert.ok(weak.length >= 1);
    assert.ok(weak[0].suggestions.includes('Developed') || weak[0].suggestions.includes('Engineered'));
  });
});
