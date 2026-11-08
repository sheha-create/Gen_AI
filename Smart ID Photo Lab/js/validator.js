/**
 * Smart ID Photo Lab - Technical Compliance & Validation Engine
 * Evaluates generated files against preset specifications and emits PASS, WARNING, or FAIL.
 */

export class ComplianceValidator {
  /**
   * Validate photo output against selected preset
   * @param {Object} outputData - Generated file metrics
   * @param {Object} preset - Selected preset specification
   * @param {Object} [originalMeta] - Metadata of uploaded original
   * @returns {Object} Full compliance report
   */
  static validatePhoto(outputData, preset, originalMeta = null) {
    const rules = [];
    const specs = preset.photo;

    // Rule 1: Exact Width
    const actualWidth = outputData.dimensions.width;
    const reqWidth = specs.width;
    const widthDiff = Math.abs(actualWidth - reqWidth);

    if (widthDiff === 0) {
      rules.push({
        id: 'width',
        name: 'Image Width',
        status: 'PASS',
        required: `${reqWidth} px`,
        actual: `${actualWidth} px`,
        details: 'Image width matches the official portal specification exactly.'
      });
    } else {
      rules.push({
        id: 'width',
        name: 'Image Width',
        status: 'FAIL',
        required: `${reqWidth} px`,
        actual: `${actualWidth} px`,
        details: `Width does not match required ${reqWidth} px. Resample or crop to exact dimensions.`
      });
    }

    // Rule 2: Exact Height
    const actualHeight = outputData.dimensions.height;
    const reqHeight = specs.height;
    const heightDiff = Math.abs(actualHeight - reqHeight);

    if (heightDiff === 0) {
      rules.push({
        id: 'height',
        name: 'Image Height',
        status: 'PASS',
        required: `${reqHeight} px`,
        actual: `${actualHeight} px`,
        details: 'Image height matches the official portal specification exactly.'
      });
    } else {
      rules.push({
        id: 'height',
        name: 'Image Height',
        status: 'FAIL',
        required: `${reqHeight} px`,
        actual: `${actualHeight} px`,
        details: `Height does not match required ${reqHeight} px. Resample or crop to exact dimensions.`
      });
    }

    // Rule 3: Aspect Ratio
    const actualAspect = actualWidth / actualHeight;
    const reqAspect = reqWidth / reqHeight;
    const aspectDiff = Math.abs(actualAspect - reqAspect);

    if (aspectDiff < 0.005) {
      rules.push({
        id: 'aspect_ratio',
        name: 'Aspect Ratio',
        status: 'PASS',
        required: `${reqAspect.toFixed(2)} (${reqWidth}:${reqHeight})`,
        actual: `${actualAspect.toFixed(2)}`,
        details: 'Aspect ratio strictly conforms to portal geometry.'
      });
    } else {
      rules.push({
        id: 'aspect_ratio',
        name: 'Aspect Ratio',
        status: 'FAIL',
        required: `${reqAspect.toFixed(2)}`,
        actual: `${actualAspect.toFixed(2)}`,
        details: 'Aspect ratio deviation detected. Please re-align crop rectangle.'
      });
    }

    // Rule 4: Maximum File Size (KB limit)
    const actualKB = outputData.kb;
    const maxKB = specs.maxKB;

    if (actualKB <= maxKB) {
      rules.push({
        id: 'max_file_size',
        name: 'Max File Size Limit',
        status: 'PASS',
        required: `≤ ${maxKB} KB`,
        actual: `${actualKB} KB (${outputData.bytes.toLocaleString()} bytes)`,
        details: `File size is comfortably under the upper boundary of ${maxKB} KB.`
      });
    } else {
      rules.push({
        id: 'max_file_size',
        name: 'Max File Size Limit',
        status: 'FAIL',
        required: `≤ ${maxKB} KB`,
        actual: `${actualKB} KB (${outputData.bytes.toLocaleString()} bytes)`,
        details: `File size exceeds portal limit by ${(actualKB - maxKB).toFixed(1)} KB. Portal will reject upload.`
      });
    }

    // Rule 5: Minimum File Size (if portal enforces a minimum, e.g. 20 KB)
    if (specs.minKB && specs.minKB > 0) {
      const minKB = specs.minKB;
      if (actualKB >= minKB) {
        rules.push({
          id: 'min_file_size',
          name: 'Min File Size Limit',
          status: 'PASS',
          required: `≥ ${minKB} KB`,
          actual: `${actualKB} KB`,
          details: `File size is above the required minimum threshold of ${minKB} KB.`
        });
      } else {
        rules.push({
          id: 'min_file_size',
          name: 'Min File Size Limit',
          status: 'WARNING',
          required: `≥ ${minKB} KB`,
          actual: `${actualKB} KB`,
          details: `Portal recommends at least ${minKB} KB. Very low file size may indicate excessive compression or blurriness.`
        });
      }
    }

    // Rule 6: Output File Format
    const actualFormat = outputData.format;
    const reqFormat = specs.format;

    if (actualFormat === reqFormat || (reqFormat === 'image/jpeg' && actualFormat === 'image/jpg')) {
      rules.push({
        id: 'format',
        name: 'File Format',
        status: 'PASS',
        required: specs.extension.toUpperCase(),
        actual: actualFormat.split('/')[1].toUpperCase(),
        details: `Accepted ${specs.extension.toUpperCase()} format properly encoded.`
      });
    } else {
      rules.push({
        id: 'format',
        name: 'File Format',
        status: 'FAIL',
        required: specs.extension.toUpperCase(),
        actual: actualFormat.split('/')[1].toUpperCase(),
        details: `Portal requires ${specs.extension.toUpperCase()} format.`
      });
    }

    // Rule 7: Source Resolution / Pixelation Check
    if (originalMeta) {
      const isUpscaled = originalMeta.width < reqWidth || originalMeta.height < reqHeight;
      if (isUpscaled) {
        rules.push({
          id: 'resolution_quality',
          name: 'Source Resolution',
          status: 'WARNING',
          required: `≥ ${reqWidth}×${reqHeight} px original`,
          actual: `${originalMeta.width}×${originalMeta.height} px source`,
          details: 'Uploaded original photo is smaller than target dimensions. Minor pixelation may be visible.'
        });
      } else {
        rules.push({
          id: 'resolution_quality',
          name: 'Source Resolution',
          status: 'PASS',
          required: `≥ ${reqWidth}×${reqHeight} px`,
          actual: `${originalMeta.width}×${originalMeta.height} px`,
          details: 'Source photo provides high native clarity and detail.'
        });
      }
    }

    // Overall Status Computation
    const hasFail = rules.some(r => r.status === 'FAIL');
    const hasWarning = rules.some(r => r.status === 'WARNING');
    const overallStatus = hasFail ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';

    return {
      type: 'photo',
      presetName: preset.name,
      overallStatus,
      totalRules: rules.length,
      passedCount: rules.filter(r => r.status === 'PASS').length,
      warningCount: rules.filter(r => r.status === 'WARNING').length,
      failedCount: rules.filter(r => r.status === 'FAIL').length,
      rules,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate signature output against selected preset
   */
  static validateSignature(outputData, preset) {
    if (!preset.signature || !preset.signature.required) {
      return {
        type: 'signature',
        presetName: preset.name,
        overallStatus: 'PASS',
        totalRules: 0,
        rules: [],
        message: 'Signature is optional for this preset.'
      };
    }

    const rules = [];
    const specs = preset.signature;

    // Width
    const actualWidth = outputData.dimensions.width;
    const reqWidth = specs.width;
    if (actualWidth === reqWidth) {
      rules.push({
        id: 'sig_width',
        name: 'Signature Width',
        status: 'PASS',
        required: `${reqWidth} px`,
        actual: `${actualWidth} px`,
        details: 'Signature width conforms to form requirements.'
      });
    } else {
      rules.push({
        id: 'sig_width',
        name: 'Signature Width',
        status: 'FAIL',
        required: `${reqWidth} px`,
        actual: `${actualWidth} px`,
        details: `Signature width must be ${reqWidth} px.`
      });
    }

    // Height
    const actualHeight = outputData.dimensions.height;
    const reqHeight = specs.height;
    if (actualHeight === reqHeight) {
      rules.push({
        id: 'sig_height',
        name: 'Signature Height',
        status: 'PASS',
        required: `${reqHeight} px`,
        actual: `${actualHeight} px`,
        details: 'Signature height conforms to form requirements.'
      });
    } else {
      rules.push({
        id: 'sig_height',
        name: 'Signature Height',
        status: 'FAIL',
        required: `${reqHeight} px`,
        actual: `${actualHeight} px`,
        details: `Signature height must be ${reqHeight} px.`
      });
    }

    // Size
    const actualKB = outputData.kb;
    const maxKB = specs.maxKB;
    if (actualKB <= maxKB) {
      rules.push({
        id: 'sig_size_max',
        name: 'Signature Max Size',
        status: 'PASS',
        required: `≤ ${maxKB} KB`,
        actual: `${actualKB} KB (${outputData.bytes.toLocaleString()} bytes)`,
        details: `Signature size strictly within ${maxKB} KB boundary.`
      });
    } else {
      rules.push({
        id: 'sig_size_max',
        name: 'Signature Max Size',
        status: 'FAIL',
        required: `≤ ${maxKB} KB`,
        actual: `${actualKB} KB`,
        details: `Signature size exceeds max ${maxKB} KB.`
      });
    }

    // Min Size
    if (specs.minKB && specs.minKB > 0) {
      const minKB = specs.minKB;
      if (actualKB >= minKB) {
        rules.push({
          id: 'sig_size_min',
          name: 'Signature Min Size',
          status: 'PASS',
          required: `≥ ${minKB} KB`,
          actual: `${actualKB} KB`,
          details: `Signature size is above minimum limit of ${minKB} KB.`
        });
      } else {
        rules.push({
          id: 'sig_size_min',
          name: 'Signature Min Size',
          status: 'WARNING',
          required: `≥ ${minKB} KB`,
          actual: `${actualKB} KB`,
          details: `Signature is smaller than ${minKB} KB. Check clarity.`
        });
      }
    }

    const hasFail = rules.some(r => r.status === 'FAIL');
    const hasWarning = rules.some(r => r.status === 'WARNING');
    const overallStatus = hasFail ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';

    return {
      type: 'signature',
      presetName: preset.name,
      overallStatus,
      totalRules: rules.length,
      passedCount: rules.filter(r => r.status === 'PASS').length,
      warningCount: rules.filter(r => r.status === 'WARNING').length,
      failedCount: rules.filter(r => r.status === 'FAIL').length,
      rules,
      timestamp: new Date().toISOString()
    };
  }
}
