/**
 * Smart ID Photo Lab - Intelligent Iterative Canvas Compression Engine
 * Meets FR-06 & Section 11: Strict Blob size verification via binary search.
 */

/**
 * Convert Canvas to Blob with specified mime type and quality
 * @param {HTMLCanvasElement} canvas
 * @param {string} mimeType
 * @param {number} quality (0.01 - 1.0)
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, mimeType = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        },
        mimeType,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Intelligent Iterative Compression Engine using Binary Search
 * Guaranteed to find the highest image quality that strictly stays below maxKB.
 * 
 * @param {HTMLCanvasElement} canvas - The prepared canvas at exact target dimensions
 * @param {Object} options
 * @param {number} options.maxKB - Upper file size limit in KB
 * @param {number} [options.minKB=0] - Optional lower file size limit in KB
 * @param {string} [options.format='image/jpeg'] - Output format
 * @param {number} [options.maxIterations=10] - Binary search iterations limit
 * @param {number} [options.minAcceptableQuality=0.08] - Honest floor quality
 * @returns {Promise<Object>} Detailed compression result
 */
export async function compressCanvasToTargetKB(canvas, options = {}) {
  const {
    maxKB,
    minKB = 0,
    format = 'image/jpeg',
    maxIterations = 10,
    minAcceptableQuality = 0.08
  } = options;

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Invalid canvas provided for compression.');
  }

  const maxBytes = Math.floor(maxKB * 1024);
  const minBytes = Math.floor(minKB * 1024);

  // PNG does not support lossy quality parameter in browser Canvas.toBlob
  if (format === 'image/png') {
    const pngBlob = await canvasToBlob(canvas, 'image/png');
    const meetsLimit = pngBlob.size <= maxBytes;
    const meetsMin = minBytes === 0 || pngBlob.size >= minBytes;
    return {
      success: meetsLimit,
      blob: pngBlob,
      bytes: pngBlob.size,
      kb: parseFloat((pngBlob.size / 1024).toFixed(2)),
      quality: 1.0,
      iterations: 1,
      meetsLimit,
      meetsMin,
      maxBytes,
      minBytes,
      format: 'image/png',
      dimensions: { width: canvas.width, height: canvas.height },
      history: [{ quality: 1.0, sizeBytes: pngBlob.size, pass: meetsLimit }],
      message: meetsLimit 
        ? 'PNG export succeeded within target size limit.'
        : `PNG format lossless compression resulted in ${(pngBlob.size/1024).toFixed(1)} KB, which exceeds the ${maxKB} KB limit.`
    };
  }

  // JPEG / WebP lossy binary search
  const history = [];

  // Step 1: Test maximum quality (0.98)
  let bestBlob = null;
  let bestQuality = 0.95;

  const initialHighBlob = await canvasToBlob(canvas, format, 0.98);
  history.push({
    iteration: 1,
    quality: 0.98,
    sizeBytes: initialHighBlob.size,
    kb: parseFloat((initialHighBlob.size / 1024).toFixed(2)),
    pass: initialHighBlob.size <= maxBytes
  });

  if (initialHighBlob.size <= maxBytes) {
    // Already below max limit even at near 100% quality!
    return {
      success: true,
      blob: initialHighBlob,
      bytes: initialHighBlob.size,
      kb: parseFloat((initialHighBlob.size / 1024).toFixed(2)),
      quality: 0.98,
      iterations: 1,
      meetsLimit: true,
      meetsMin: minBytes === 0 || initialHighBlob.size >= minBytes,
      maxBytes,
      minBytes,
      format,
      dimensions: { width: canvas.width, height: canvas.height },
      history,
      message: `Optimal quality (98%) meets the ${maxKB} KB limit directly without compression sacrifice.`
    };
  }

  // Step 2: Binary search on quality in [minAcceptableQuality, 0.95]
  let lowQ = minAcceptableQuality;
  let highQ = 0.95;
  let iteration = 1;

  while (iteration <= maxIterations && (highQ - lowQ) > 0.02) {
    iteration++;
    const midQ = parseFloat(((lowQ + highQ) / 2).toFixed(3));
    const testBlob = await canvasToBlob(canvas, format, midQ);

    const isPass = testBlob.size <= maxBytes;
    history.push({
      iteration,
      quality: midQ,
      sizeBytes: testBlob.size,
      kb: parseFloat((testBlob.size / 1024).toFixed(2)),
      pass: isPass
    });

    if (isPass) {
      bestBlob = testBlob;
      bestQuality = midQ;
      // Try pushing higher quality to avoid unnecessary degradation
      lowQ = midQ;
    } else {
      // Must reduce quality
      highQ = midQ;
    }
  }

  // If even lowest tested binary quality did not pass, test absolute lowest allowed floor
  if (!bestBlob) {
    const floorBlob = await canvasToBlob(canvas, format, minAcceptableQuality);
    history.push({
      iteration: iteration + 1,
      quality: minAcceptableQuality,
      sizeBytes: floorBlob.size,
      kb: parseFloat((floorBlob.size / 1024).toFixed(2)),
      pass: floorBlob.size <= maxBytes
    });

    if (floorBlob.size <= maxBytes) {
      bestBlob = floorBlob;
      bestQuality = minAcceptableQuality;
    } else {
      // Honest failure: Image cannot meet the size limit without unacceptable degradation
      return {
        success: false,
        blob: floorBlob,
        bytes: floorBlob.size,
        kb: parseFloat((floorBlob.size / 1024).toFixed(2)),
        quality: minAcceptableQuality,
        iterations: history.length,
        meetsLimit: false,
        meetsMin: false,
        maxBytes,
        minBytes,
        format,
        dimensions: { width: canvas.width, height: canvas.height },
        history,
        message: `Unable to compress strictly below ${maxKB} KB without severe artifacting (at ${minAcceptableQuality * 100}% quality, size is ${(floorBlob.size / 1024).toFixed(1)} KB). Consider simplifying background or choosing higher dimension bounds.`
      };
    }
  }

  // We found an optimal blob that strictly satisfies <= maxBytes
  const finalKb = parseFloat((bestBlob.size / 1024).toFixed(2));
  const meetsMin = minBytes === 0 || bestBlob.size >= minBytes;

  return {
    success: true,
    blob: bestBlob,
    bytes: bestBlob.size,
    kb: finalKb,
    quality: bestQuality,
    iterations: history.length,
    meetsLimit: true,
    meetsMin,
    maxBytes,
    minBytes,
    format,
    dimensions: { width: canvas.width, height: canvas.height },
    history,
    message: `Compressed successfully to ${finalKb} KB (under ${maxKB} KB target limit) at ${(bestQuality * 100).toFixed(0)}% quality in ${history.length} iterations.`
  };
}
