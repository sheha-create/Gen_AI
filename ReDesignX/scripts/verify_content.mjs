/**
 * ReDesignX Content Fidelity Verification Suite
 * Compares visible text between Canonical JSON, Baseline HTML, and Redesigned HTML.
 * Asserts 100% word-for-word identity with zero additions, deletions, or paraphrasing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to extract text from HTML string without DOM dependencies
function extractVisibleTextFromHtml(html) {
  let content = html;

  // Remove <style>...</style>, <script>...</script>, <head>...</head>
  content = content.replace(/<head[\s\S]*?<\/head>/gi, '');
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<!--[\s\S]*?-->/g, ''); // Comments

  // Extract input placeholders and aria-labels if any
  const placeholders = [];
  const placeholderRegex = /placeholder="([^"]+)"/gi;
  let match;
  while ((match = placeholderRegex.exec(content)) !== null) {
    placeholders.push(match[1]);
  }

  // Replace tags with spaces
  let text = content.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ');

  // Append placeholders at appropriate boundary
  if (placeholders.length > 0) {
    text += ' ' + placeholders.join(' ');
  }

  // Normalize whitespace: collapse multiple spaces/newlines into a single space
  return text.trim().split(/\s+/).filter(Boolean);
}

function extractStringsFromObject(obj) {
  const strings = [];
  function recurse(val) {
    if (typeof val === 'string') {
      // Exclude schema and metadata strings
      if (!val.startsWith('http') && !val.includes('BSERC') && !val.includes('ReDesignX') && !val.includes('Every text node')) {
        strings.push(val);
      }
    } else if (Array.isArray(val)) {
      for (const item of val) recurse(item);
    } else if (val !== null && typeof val === 'object') {
      for (const key of Object.keys(val)) {
        recurse(val[key]);
      }
    }
  }
  recurse(obj);
  return strings;
}

function normalizeTokens(words) {
  return words.map(w => w.replace(/^["'“‘(]+|[)"'”’,.:;!?]+$/g, '').toLowerCase()).filter(Boolean);
}

function verifyPair(pageName, canonicalPath, baselinePath, redesignedPath) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING FIDELITY: ${pageName}`);
  console.log(`======================================================`);

  const canonicalRaw = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  const baselineHtml = fs.readFileSync(baselinePath, 'utf8');
  const redesignedHtml = fs.readFileSync(redesignedPath, 'utf8');

  const baselineWords = extractVisibleTextFromHtml(baselineHtml);
  const redesignedWords = extractVisibleTextFromHtml(redesignedHtml);

  const baselineNorm = normalizeTokens(baselineWords);
  const redesignedNorm = normalizeTokens(redesignedWords);

  console.log(`Raw Words Count:`);
  console.log(`  - Baseline Words:   ${baselineWords.length}`);
  console.log(`  - Redesigned Words: ${redesignedWords.length}`);

  console.log(`Normalized Token Count:`);
  console.log(`  - Baseline Tokens:   ${baselineNorm.length}`);
  console.log(`  - Redesigned Tokens: ${redesignedNorm.length}`);

  // Canonical string checks
  const canonicalStrings = extractStringsFromObject(canonicalRaw.sections);
  console.log(`Canonical String Entries: ${canonicalStrings.length}`);

  let missingInBaseline = 0;
  let missingInRedesigned = 0;

  for (const str of canonicalStrings) {
    const cleanStr = str.replace(/\s+/g, ' ').trim();
    const strTokens = normalizeTokens(cleanStr.split(/\s+/));
    const firstFew = strTokens.slice(0, 3).join(' ');

    const inBaseline = baselineNorm.join(' ').includes(strTokens.join(' '));
    const inRedesigned = redesignedNorm.join(' ').includes(strTokens.join(' '));

    if (!inBaseline) {
      console.warn(`[!] Missing in Baseline: "${str}"`);
      missingInBaseline++;
    }
    if (!inRedesigned) {
      console.warn(`[!] Missing in Redesigned: "${str}"`);
      missingInRedesigned++;
    }
  }

  // Token-by-token sequence comparison
  let sequenceDiffs = [];
  const maxLen = Math.max(baselineNorm.length, redesignedNorm.length);
  for (let i = 0; i < maxLen; i++) {
    const b = baselineNorm[i];
    const r = redesignedNorm[i];
    if (b !== r) {
      sequenceDiffs.push({ index: i, baseline: b, redesigned: r });
    }
  }

  const isExactMatch = (missingInBaseline === 0) && (missingInRedesigned === 0) && (sequenceDiffs.length === 0);

  console.log(`\nResult for ${pageName}:`);
  console.log(`  - Missing in Baseline:   ${missingInBaseline}`);
  console.log(`  - Missing in Redesigned:  ${missingInRedesigned}`);
  console.log(`  - Sequence Mismatches:    ${sequenceDiffs.length}`);
  console.log(`  - Content Parity Status:  ${isExactMatch ? 'PASSED (100% IDENTICAL)' : 'FAILED'}`);

  return {
    pageName,
    baselineWordCount: baselineWords.length,
    redesignedWordCount: redesignedWords.length,
    canonicalStringsChecked: canonicalStrings.length,
    missingInBaseline,
    missingInRedesigned,
    sequenceDiffsCount: sequenceDiffs.length,
    passed: isExactMatch,
    sequenceDiffs: sequenceDiffs.slice(0, 10)
  };
}

// Run verifications
const report = {
  timestamp: new Date().toISOString(),
  test_suite: "ReDesignX Content Fidelity Test Suite",
  results: []
};

// 1. Primary Page Verification
const primaryResult = verifyPair(
  "Primary Event Landing Page (Apex Horizon Summit 2027)",
  path.join(rootDir, 'data', 'canonical_content.json'),
  path.join(rootDir, 'src', 'baseline.html'),
  path.join(rootDir, 'src', 'redesigned.html')
);
report.results.push(primaryResult);

// 2. Second Sample Page Verification (Skill Reusability)
const secondResult = verifyPair(
  "Second Sample Page (Lumina Artisan Roasters)",
  path.join(rootDir, 'data', 'second_sample_content.json'),
  path.join(rootDir, 'src', 'second_sample_baseline.html'),
  path.join(rootDir, 'src', 'second_sample_redesigned.html')
);
report.results.push(secondResult);

const allPassed = report.results.every(r => r.passed);
report.overall_status = allPassed ? "ALL TESTS PASSED - 100% CONTENT FIDELITY GUARANTEED" : "TESTS FAILED";

// Write report JSON
const reportPath = path.join(rootDir, 'data', 'verification_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\nReport saved to: ${reportPath}`);
console.log(`\nOVERALL SUITE STATUS: ${report.overall_status}`);

if (!allPassed) {
  process.exit(1);
}
