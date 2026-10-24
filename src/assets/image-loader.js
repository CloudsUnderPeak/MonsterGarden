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

  function loadImage(path) {
    return new Promise((resolve) => {
      const image = new Image();
      // A stalled image must not prevent other residents from appearing.
      const timeout = setTimeout(() => resolve(null), 15000);
      image.onload = () => {
        clearTimeout(timeout);
        try {
          resolve({
            image,
            crop: findBounds(image),
            name: path.split('/').pop().replace(/\.(png|avif)$/i, ''),
          });
        } catch {
          resolve(null);
        }
      };
      image.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
      image.src = path.split('/').map(encodeURIComponent).join('/');
    });
  }

  Garden.loadMonsterImages = async function (paths) {
    const results = await Promise.all(paths.map(loadImage));
    return {
      assets: results.filter(Boolean),
      failed: results.filter((asset) => !asset).length,
    };
  };
})(window.MonsterGarden);
