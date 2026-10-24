(function (Garden) {
  'use strict';

  const usesHttp = /^https?:$/.test(window.location.protocol);

  async function revalidate(url, signal) {
    // Keep stable URLs so the browser can send its cached ETag/Last-Modified.
    // Fetch merges a 304 response with the cached body automatically.
    const response = await fetch(url, { cache: 'no-cache', signal });
    if (!response.ok) throw new Error(`Unable to load ${url}: HTTP ${response.status}`);
    return response;
  }

  async function refreshScript(path) {
    // Local files retain the classic script already loaded by index.html.
    if (!usesHttp) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let objectUrl;
    try {
      const response = await revalidate(path, controller.signal);
      const source = await response.text();
      objectUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');

        function finish(error) {
          script.onload = null;
          script.onerror = null;
          controller.signal.removeEventListener('abort', abort);
          script.remove();
          if (error) reject(error);
          else resolve();
        }

        function abort() {
          finish(new Error(`Script loading timed out: ${path}`));
        }

        script.onload = () => finish();
        script.onerror = () => finish(new Error(`Unable to execute ${path}`));
        controller.signal.addEventListener('abort', abort, { once: true });
        if (controller.signal.aborted) {
          abort();
          return;
        }
        // Execute the revalidated catalog body rather than the earlier cached script.
        script.src = objectUrl;
        document.head.append(script);
      });
    } finally {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  Garden.resources = Object.freeze({ usesHttp, revalidate, refreshScript });
})(window.MonsterGarden);
