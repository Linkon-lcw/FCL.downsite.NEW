// 这两个依赖只在介绍正文或明确声明为 HTML 的远程描述首次展示时加载，
// 完整性哈希防止 CDN 内容被替换后仍在本站上下文执行。
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
// 同一种依赖可能被多个展开面板同时触发；复用 Promise 可避免重复插入 script 标签。
const scriptPromises = new Map();

/**
 * 懒加载固定版本的全局脚本。
 * 加载失败后会移除缓存，以便用户稍后重试，而不是永久保留失败状态。
 */
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
  // 远程内容内的相对地址必须以原文档地址为基准解析，不能以下载站当前页面为基准。
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
  // DOMPurify 负责删除危险标签/属性；本函数再收紧协议并补齐相对地址，二者缺一不可。
  root.querySelectorAll('[href]').forEach((element) => {
    const href = makeAbsoluteUrl(element.getAttribute('href'), baseUrl);
    if (href) element.setAttribute('href', href);
    else element.removeAttribute('href');
    // 只有跨域链接才新开窗口；页内锚点保持原行为，避免意外跳出当前文档。
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
  // Markdown 先转 HTML，再与原生 HTML 走同一套白名单净化策略。
  const [DOMPurify, markdownParser] = await Promise.all([
    loadExternalScript(DOM_PURIFY),
    type === 'md' ? loadExternalScript(MARKED) : Promise.resolve(null),
  ]);
  const rawHtml = type === 'md'
    ? markdownParser.parse(rawContent, { async: false })
    : rawContent;
  // 禁用可执行/可嵌入的标签，即使远程仓库内容被篡改也无法在本站执行脚本。
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form'],
    FORBID_ATTR: ['srcdoc'],
    ALLOW_DATA_ATTR: false,
  });
  const template = document.createElement('template');
  // 此处是唯一允许写入 innerHTML 的边界：输入已经经过 DOMPurify 净化。
  template.innerHTML = cleanHtml;
  rewriteUrls(template.content, baseUrl);
  return template.content;
}

export function isSafeNavigationUrl(value, { allowRelative = true } = {}) {
  // 动态写入 href 前的轻量校验；下载链接调用时会关闭相对路径支持。
  if (allowRelative && typeof value === 'string' && value.startsWith('/')) return true;
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
