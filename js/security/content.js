const MARKED = {
  src: 'https://cdn.jsdelivr.net/npm/marked@15.0.12/lib/marked.umd.min.js',
  integrity: 'sha384-zCewoQXXb5Xf+2nvCjab0EbMl7FWVpJMsKyrc8M8DqxjFra4DY4XHwheVdHXa34k',
  globalName: 'marked',
};
const DOM_PURIFY = {
  src: 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js',
  integrity: 'sha384-JEyTNhjM6R1ElGoJns4U2Ln4ofPcqzSsynQkmEc/KGy6336qAZl70tDLufbkla+3',
  globalName: 'DOMPurify',
};
const scriptPromises = new Map();

export function loadExternalScript({ src, integrity, globalName }) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  if (scriptPromises.has(src)) return scriptPromises.get(src);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      if (window[globalName]) resolve(window[globalName]);
      else reject(new Error(`依赖加载后未找到 ${globalName}`));
    }, { once: true });
    script.addEventListener('error', () => reject(new Error(`无法加载依赖：${src}`)), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromises.delete(src);
    throw error;
  });

  scriptPromises.set(src, promise);
  return promise;
}

function makeAbsoluteUrl(value, baseUrl, allowDataImage = false) {
  if (!value || value.startsWith('#')) return value;
  try {
    const resolved = new URL(value, baseUrl || window.location.href);
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') return resolved.href;
    if (allowDataImage && resolved.protocol === 'data:' && /^data:image\//i.test(value)) return value;
  } catch (_) {
    // 无效 URL 会在下方被清除。
  }
  return '';
}

function rewriteUrls(root, baseUrl) {
  root.querySelectorAll('[href]').forEach((element) => {
    const href = makeAbsoluteUrl(element.getAttribute('href'), baseUrl);
    if (href) element.setAttribute('href', href);
    else element.removeAttribute('href');
    if (element.tagName === 'A' && href && !href.startsWith('#')) {
      try {
        if (new URL(href, window.location.href).origin !== window.location.origin) {
          element.target = '_blank';
          element.rel = 'noopener noreferrer';
        }
      } catch (_) {
        element.removeAttribute('href');
      }
    }
  });

  root.querySelectorAll('img[src], source[src]').forEach((element) => {
    const src = makeAbsoluteUrl(element.getAttribute('src'), baseUrl, true);
    if (src) element.setAttribute('src', src);
    else element.removeAttribute('src');
    if (element.tagName === 'IMG') {
      element.loading = 'lazy';
      element.decoding = 'async';
    }
  });
}

export async function createSafeContent(rawContent, { type = 'html', baseUrl } = {}) {
  const [DOMPurify, markdownParser] = await Promise.all([
    loadExternalScript(DOM_PURIFY),
    type === 'md' ? loadExternalScript(MARKED) : Promise.resolve(null),
  ]);
  const rawHtml = type === 'md'
    ? markdownParser.parse(rawContent, { async: false })
    : rawContent;
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'],
    FORBID_ATTR: ['srcdoc'],
    ALLOW_DATA_ATTR: false,
  });
  const template = document.createElement('template');
  template.innerHTML = cleanHtml;
  rewriteUrls(template.content, baseUrl);
  return template.content;
}

export function isSafeNavigationUrl(value, { allowRelative = true } = {}) {
  if (allowRelative && typeof value === 'string' && value.startsWith('/')) return true;
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
