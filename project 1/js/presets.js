/**
 * Smart ID Photo Lab - Presets Module
 * Verified specifications from official exam and recruitment notification documents.
 */

export const VERIFIED_PRESETS = [
  {
    id: 'upsc_otr',
    name: 'UPSC Civil Services / OTR',
    organization: 'Union Public Service Commission (India)',
    category: 'Government / Civil Services',
    officialSourceUrl: 'https://upsconline.nic.in',
    dateChecked: '2024-11-15',
    description: 'Official specifications for UPSC One Time Registration (OTR) and CSE application forms.',
    photo: {
      width: 350,
      height: 350,
      aspectRatio: 1, // 1:1
      units: 'px',
      minKB: 20,
      maxKB: 300,
      format: 'image/jpeg',
      extension: 'jpg',
      backgroundRule: 'Plain light or white background; face must cover 3/4th (approx. 75%) of the photo.',
      guidelines: 'Clear frontal view, eyes open, neutral expression. No hats or dark glasses.'
    },
    signature: {
      required: true,
      width: 350,
      height: 350,
      aspectRatio: 1,
      units: 'px',
      minKB: 20,
      maxKB: 300,
      format: 'image/jpeg',
      extension: 'jpg',
      notes: 'Sign on white paper with black ballpoint pen; crop squarely around signature.'
    }
  },
  {
    id: 'ssc_cgl',
    name: 'SSC CGL / CHSL / MTS',
    organization: 'Staff Selection Commission (India)',
    category: 'Recruitment Exams',
    officialSourceUrl: 'https://ssc.gov.in',
    dateChecked: '2024-10-20',
    description: 'Mandatory standard photo and signature dimensions for SSC application portals.',
    photo: {
      width: 200,
      height: 230,
      aspectRatio: 200 / 230, // ~0.8696 (3.5 cm x 4.5 cm)
      units: 'px',
      minKB: 20,
      maxKB: 50,
      format: 'image/jpeg',
      extension: 'jpg',
      backgroundRule: 'Light plain background; clear face without cap or spectacles.',
      guidelines: '3.5 cm width x 4.5 cm height (~200 x 230 px at standard screen resolution).'
    },
    signature: {
      required: true,
      width: 140,
      height: 60,
      aspectRatio: 140 / 60, // 2.333 (4.0 cm x 2.0 cm)
      units: 'px',
      minKB: 10,
      maxKB: 20,
      format: 'image/jpeg',
      extension: 'jpg',
      notes: 'Black ink on white paper, clearly visible without blur or smudges.'
    }
  },
  {
    id: 'gate_exam',
    name: 'GATE (IIT Entrance)',
    organization: 'Indian Institute of Technology / GATE Committee',
    category: 'Higher Education Entrance',
    officialSourceUrl: 'https://gate2025.iitr.ac.in',
    dateChecked: '2024-09-10',
    description: 'Specifications as defined in the GATE Information Brochure for applicant photograph & signature.',
    photo: {
      width: 480,
      height: 640,
      aspectRatio: 480 / 640, // 0.75 (3.5 cm x 4.5 cm)
      units: 'px',
      minKB: 50,
      maxKB: 200,
      format: 'image/jpeg',
      extension: 'jpg',
      backgroundRule: 'White or very light background; face must occupy 60% to 70% of image height.',
      guidelines: 'High-quality studio photo, ears clearly visible, no selfie, no shadow.'
    },
    signature: {
      required: true,
      width: 560,
      height: 160,
      aspectRatio: 560 / 160, // 3.5 (7.0 cm x 2.0 cm)
      units: 'px',
      minKB: 5,
      maxKB: 200,
      format: 'image/jpeg',
      extension: 'jpg',
      notes: 'Black or dark blue ink signature in rectangle box, no initials only.'
    }
  },
  {
    id: 'ibps_bank',
    name: 'IBPS PO / Clerk / SO',
    organization: 'Institute of Banking Personnel Selection',
    category: 'Banking Recruitment',
    officialSourceUrl: 'https://www.ibps.in',
    dateChecked: '2024-08-05',
    description: 'Common Recruitment Process (CRP) image specifications for Public Sector Bank exams.',
    photo: {
      width: 200,
      height: 230,
      aspectRatio: 200 / 230,
      units: 'px',
      minKB: 20,
      maxKB: 50,
      format: 'image/jpeg',
      extension: 'jpg',
      backgroundRule: 'Light coloured, preferably white background. Eyes looking straight into camera.',
      guidelines: 'Dimensions 200 x 230 pixels. Face should be clearly visible with no red eye.'
    },
    signature: {
      required: true,
      width: 140,
      height: 60,
      aspectRatio: 140 / 60,
      units: 'px',
      minKB: 10,
      maxKB: 20,
      format: 'image/jpeg',
      extension: 'jpg',
      notes: 'Signature in CAPITAL letters is strictly rejected by IBPS.'
    }
  },
  {
    id: 'us_visa',
    name: 'US Visa & Passport (DS-160)',
    organization: 'U.S. Department of State - Consular Affairs',
    category: 'Travel / Visa / Passport',
    officialSourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    dateChecked: '2024-11-01',
    description: 'Mandatory biometric photo standards for US Nonimmigrant and Immigrant visa applications.',
    photo: {
      width: 600,
      height: 600,
      aspectRatio: 1, // 1:1 square (2 x 2 inches at 300 DPI)
      units: 'px',
      minKB: 10,
      maxKB: 240,
      format: 'image/jpeg',
      extension: 'jpg',
      backgroundRule: 'Plain white or off-white background with no shadows or texture.',
      guidelines: 'Head must be centered and measure between 50% and 69% of the image total height.'
    },
    signature: {
      required: false,
      width: 600,
      height: 300,
      aspectRatio: 2,
      units: 'px',
      minKB: 10,
      maxKB: 240,
      format: 'image/jpeg',
      extension: 'jpg',
      notes: 'Optional for certain DS-160 affidavit attachments.'
    }
  }
];

const CUSTOM_PRESETS_STORAGE_KEY = 'smart_id_photo_lab_custom_presets_v1';

/**
 * Retrieve all custom presets saved in localStorage
 */
export function getCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse custom presets from localStorage', err);
    return [];
  }
}

/**
 * Retrieve all presets (verified + user custom)
 */
export function getAllPresets() {
  return [...VERIFIED_PRESETS, ...getCustomPresets()];
}

/**
 * Retrieve preset by unique ID
 */
export function getPresetById(id) {
  return getAllPresets().find(p => p.id === id) || VERIFIED_PRESETS[0];
}

/**
 * Validate custom preset parameters according to FR-04 and PRD Section 10
 */
export function validateCustomPresetData(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Preset name is required.');
  } else if (data.name.trim().length > 50) {
    errors.push('Preset name must be 50 characters or fewer.');
  }

  const pWidth = parseInt(data.photoWidth, 10);
  const pHeight = parseInt(data.photoHeight, 10);
  const pMaxKB = parseFloat(data.photoMaxKB);
  const pMinKB = data.photoMinKB !== undefined && data.photoMinKB !== '' ? parseFloat(data.photoMinKB) : 0;

  if (isNaN(pWidth) || pWidth <= 0 || pWidth < 50 || pWidth > 8000) {
    errors.push('Photo width must be an integer between 50 and 8000 px.');
  }
  if (isNaN(pHeight) || pHeight <= 0 || pHeight < 50 || pHeight > 8000) {
    errors.push('Photo height must be an integer between 50 and 8000 px.');
  }
  if (isNaN(pMaxKB) || pMaxKB <= 0 || pMaxKB < 5 || pMaxKB > 50000) {
    errors.push('Photo maximum file size must be between 5 KB and 50,000 KB.');
  }
  if (!isNaN(pMinKB) && pMinKB < 0) {
    errors.push('Photo minimum file size cannot be negative.');
  }
  if (!isNaN(pMinKB) && !isNaN(pMaxKB) && pMinKB >= pMaxKB) {
    errors.push('Photo minimum file size must be strictly less than maximum file size.');
  }

  // Signature validation if signature is enabled
  if (data.includeSignature) {
    const sWidth = parseInt(data.sigWidth, 10);
    const sHeight = parseInt(data.sigHeight, 10);
    const sMaxKB = parseFloat(data.sigMaxKB);
    const sMinKB = data.sigMinKB !== undefined && data.sigMinKB !== '' ? parseFloat(data.sigMinKB) : 0;

    if (isNaN(sWidth) || sWidth <= 0 || sWidth < 40 || sWidth > 8000) {
      errors.push('Signature width must be an integer between 40 and 8000 px.');
    }
    if (isNaN(sHeight) || sHeight <= 0 || sHeight < 20 || sHeight > 8000) {
      errors.push('Signature height must be an integer between 20 and 8000 px.');
    }
    if (isNaN(sMaxKB) || sMaxKB <= 0 || sMaxKB < 5 || sMaxKB > 50000) {
      errors.push('Signature maximum file size must be between 5 KB and 50,000 KB.');
    }
    if (!isNaN(sMinKB) && sMinKB < 0) {
      errors.push('Signature minimum file size cannot be negative.');
    }
    if (!isNaN(sMinKB) && !isNaN(sMaxKB) && sMinKB >= sMaxKB) {
      errors.push('Signature minimum file size must be strictly less than maximum file size.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Save a newly created custom preset
 */
export function saveCustomPreset(formData) {
  const validation = validateCustomPresetData(formData);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  const pWidth = parseInt(formData.photoWidth, 10);
  const pHeight = parseInt(formData.photoHeight, 10);
  const pMaxKB = parseFloat(formData.photoMaxKB);
  const pMinKB = formData.photoMinKB ? parseFloat(formData.photoMinKB) : 0;

  const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const preset = {
    id,
    isCustom: true,
    name: formData.name.trim(),
    organization: formData.organization?.trim() || 'Custom Organization / Institution',
    category: 'User Custom Preset',
    officialSourceUrl: formData.sourceUrl?.trim() || '',
    dateChecked: new Date().toISOString().split('T')[0],
    description: formData.description?.trim() || 'Custom configured photo preparation rules.',
    photo: {
      width: pWidth,
      height: pHeight,
      aspectRatio: pWidth / pHeight,
      units: 'px',
      minKB: pMinKB,
      maxKB: pMaxKB,
      format: formData.format || 'image/jpeg',
      extension: formData.format === 'image/png' ? 'png' : 'jpg',
      backgroundRule: formData.photoBackground || 'As required by application form.',
      guidelines: formData.photoGuidelines || 'Custom user guidelines.'
    },
    signature: {
      required: !!formData.includeSignature,
      width: formData.includeSignature ? parseInt(formData.sigWidth, 10) : 140,
      height: formData.includeSignature ? parseInt(formData.sigHeight, 10) : 60,
      aspectRatio: formData.includeSignature ? parseInt(formData.sigWidth, 10) / parseInt(formData.sigHeight, 10) : 2.33,
      units: 'px',
      minKB: formData.includeSignature && formData.sigMinKB ? parseFloat(formData.sigMinKB) : 0,
      maxKB: formData.includeSignature ? parseFloat(formData.sigMaxKB) : 50,
      format: formData.format || 'image/jpeg',
      extension: formData.format === 'image/png' ? 'png' : 'jpg',
      notes: formData.sigNotes || 'Sign cleanly inside bounds.'
    }
  };

  const existing = getCustomPresets();
  existing.push(preset);
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(existing));
  return preset;
}

/**
 * Delete a custom preset by ID
 */
export function deleteCustomPreset(id) {
  const existing = getCustomPresets();
  const filtered = existing.filter(p => p.id !== id);
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}
