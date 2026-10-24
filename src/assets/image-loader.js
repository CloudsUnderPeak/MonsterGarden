(function (Garden) {
  'use strict';

  // Only this module handles image decoding and transparent-border detection.
  function findBounds(image) {
    const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let pixels;
    try {
      pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (error) {
      // file:// may allow drawing an image but restrict reading its pixels.
      if (error.name === 'SecurityError') return [0, 0, image.width, image.height];
      throw error;
    }

    let left = canvas.width;
    let top = canvas.height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] <= 12) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < 0) throw new Error('Image is fully transparent');
    return [left / scale, top / scale, (right - left + 1) / scale, (bottom - top + 1) / scale];
  }

  function decodeImage(url, signal) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      function cleanup() {
        image.onload = null;
        image.onerror = null;
        signal.removeEventListener('abort', abort);
      }

      function abort() {
        cleanup();
        image.src = '';
        reject(new Error('Image loading timed out'));
      }

      image.onload = () => {
        cleanup();
        resolve(image);
      };
      image.onerror = () => {
        cleanup();
        reject(new Error('Unable to decode image'));
      };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) {
        abort();
        return;
      }
      image.src = url;
    });
  }

  async function loadImage(path) {
    const controller = new AbortController();
    // Covers both the conditional HTTP request and image decoding.
    const timeout = setTimeout(() => controller.abort(), 15000);
    let objectUrl;
    try {
      let url = path.split('/').map(encodeURIComponent).join('/');
      if (Garden.resources.usesHttp) {
        const response = await Garden.resources.revalidate(url, controller.signal);
        objectUrl = URL.createObjectURL(await response.blob());
        url = objectUrl;
      }
      const image = await decodeImage(url, controller.signal);
      const name = path.split('/').pop().replace(/\.(png|avif)$/i, '');
      return {
        image,
        crop: findBounds(image),
        name,
        sourceFacing: Garden.leftFacingMonsters?.includes(name) ? -1 : 1,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  Garden.loadMonsterImages = async function (paths) {
    const results = await Promise.all(paths.map(loadImage));
    return {
      assets: results.filter(Boolean),
      failed: results.filter((asset) => !asset).length,
    };
  };
})(window.MonsterGarden);
