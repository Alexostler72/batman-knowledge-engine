const CACHE_NAME = 'batman-knowledge-engine-materialized-v1';
const PARTS = Array.from({ length: 8 }, (_, index) => `bundle.part${String(index).padStart(2, '0')}`);
const ROOT = 'batman-knowledge-engine/';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (event.request.mode === 'navigate') {
      const page = await cache.match(new URL('index.html', self.registration.scope).href);
      if (page) return page;
    }
    return (await cache.match(event.request, { ignoreSearch: true })) || fetch(event.request);
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'MATERIALIZE') return;
  event.waitUntil(materialize(event.source));
});

async function materialize(source) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const markerUrl = new URL('__bke_ready__', self.registration.scope).href;
    if (await cache.match(markerUrl)) {
      source?.postMessage({ type: 'READY' });
      return;
    }

    notify(source, 'Reading application bundle…', 8);
    const chunks = [];
    for (let index = 0; index < PARTS.length; index += 1) {
      const response = await fetch(new URL(PARTS[index], self.registration.scope));
      if (!response.ok) throw new Error(`Missing ${PARTS[index]}`);
      chunks.push(await response.text());
      notify(source, `Reading bundle ${index + 1} of ${PARTS.length}…`, 8 + ((index + 1) / PARTS.length) * 28);
    }

    notify(source, 'Decompressing knowledge archive…', 42);
    const compressed = decodeBase64(chunks.join('').replace(/\s+/g, ''));
    if (!('DecompressionStream' in self)) throw new Error('This browser does not support gzip decompression. Use a current Chrome, Edge, Firefox, or Safari release.');
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const tar = new Uint8Array(await new Response(stream).arrayBuffer());
    const entries = readTar(tar);

    notify(source, `Installing ${entries.length} application files…`, 55);
    let completed = 0;
    for (const entry of entries) {
      let body = entry.bytes;
      if (entry.path === 'js/app.js') {
        const text = new TextDecoder().decode(body)
          .replace("await navigator.serviceWorker.register('./sw.js');", "void 0;");
        body = new TextEncoder().encode(text);
      }
      const url = new URL(entry.path, self.registration.scope).href;
      await cache.put(url, new Response(body, {
        headers: {
          'Content-Type': contentType(entry.path),
          'Cache-Control': 'no-cache'
        }
      }));
      completed += 1;
      notify(source, `Installing ${entry.path}…`, 55 + (completed / entries.length) * 42);
    }

    await cache.put(markerUrl, new Response('ready'));
    notify(source, 'Knowledge Engine ready.', 100);
    source?.postMessage({ type: 'READY' });
  } catch (error) {
    source?.postMessage({ type: 'ERROR', message: error.message || String(error) });
  }
}

function notify(source, message, progress) {
  source?.postMessage({ type: 'PROGRESS', message, progress: Math.round(progress) });
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function readTar(bytes) {
  const decoder = new TextDecoder();
  const entries = [];
  let offset = 0;
  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const name = readString(header, 0, 100, decoder);
    const prefix = readString(header, 345, 155, decoder);
    const fullName = prefix ? `${prefix}/${name}` : name;
    const sizeText = readString(header, 124, 12, decoder).trim();
    const size = Number.parseInt(sizeText || '0', 8) || 0;
    const type = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    if ((type === '0' || type === '\0') && fullName.startsWith(ROOT)) {
      const path = fullName.slice(ROOT.length);
      if (path && !path.startsWith('.github/')) entries.push({ path, bytes: bytes.slice(dataStart, dataEnd) });
    }
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  return entries;
}

function readString(bytes, start, length, decoder) {
  const slice = bytes.subarray(start, start + length);
  const zero = slice.indexOf(0);
  return decoder.decode(zero >= 0 ? slice.subarray(0, zero) : slice).trim();
}

function contentType(path) {
  const extension = path.split('.').pop().toLowerCase();
  return ({
    html: 'text/html; charset=utf-8',
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',
    json: 'application/json; charset=utf-8',
    svg: 'image/svg+xml',
    webmanifest: 'application/manifest+json'
  })[extension] || 'application/octet-stream';
}
