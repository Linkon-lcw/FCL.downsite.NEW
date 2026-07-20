import data from './module/data.js';
import utils from './module/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const id = utils.getSoftwareId();
  if (id === null) {
    showError('未指定软件 ID');
    return;
  }

  try {
    const { basic, detail } = await data.fetchSoftwareDetail(id);
    renderPage(id, basic, detail);
  } catch (err) {
    showError(err instanceof Error ? err.message : String(err));
  }
});

/**
 * 渲染页面
 * @param {number} id - 软件 ID
 * @param {{name: string, icon: string}} basic
 * @param {{intro: Array<{title: string, url: string, file: string, type: string}>}} detail
 */
function renderPage(id, basic, detail) {
  const iconEl = document.getElementById('icon');
  const titleEl = document.getElementById('title');
  const detailBtn = document.getElementById('detailBtn');

  if (detailBtn) detailBtn.href = `detail.html?id=${id}`;
  if (iconEl) {
    iconEl.src = basic.icon;
    iconEl.alt = basic.name;
  }
  if (titleEl) titleEl.textContent = `介绍${basic.name}`;
  document.title = `介绍${basic.name}`;

  if (detail.intro?.length) {
    renderIntroContent(detail.intro);
  } else {
    const container = document.getElementById('intro-content');
    if (container) {
      container.innerHTML = '<div class="mdui-typo"><p>暂无介绍文档</p></div>';
    }
  }
}

/**
 * 渲染介绍文档内容
 * @param {Array<{title: string, url: string, file: string, type: string}>} introItems
 */
async function renderIntroContent(introItems) {
  const container = document.getElementById('intro-content');
  if (!container) return;

  container.innerHTML = '';

  for (const item of introItems) {
    const panelItem = document.createElement('div');
    panelItem.className = 'mdui-panel-item mdui-panel-item-open';
    panelItem.innerHTML = `
      <div class="mdui-panel-item-header mdui-ripple">
        <div>${escapeHtml(item.title)}</div>
        <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
      </div>
      <div class="mdui-panel-item-body mdui-typo">
        <div class="mdui-spinner"></div>
      </div>
    `;

    const bodyEl = panelItem.querySelector('.mdui-panel-item-body');
    const panel = document.createElement('div');
    panel.className = 'mdui-panel';
    panel.setAttribute('mdui-panel', '');
    panel.appendChild(panelItem);
    container.appendChild(panel);

    try {
      const fullUrl = item.url + item.file;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();

      const html = item.type === 'md' ? marked.parse(text) : text;
      bodyEl.innerHTML = resolveRelativeUrls(html, item.url);
    } catch (err) {
      bodyEl.innerHTML = `<div style="color: #f00;">加载失败：${escapeHtml(err.message)}</div>`;
    }
  }

  mdui.mutation();
}

/**
 * 解析 HTML 内容中的相对链接，拼接 baseUrl 转为绝对路径
 * @param {string} html - HTML 字符串
 * @param {string} baseUrl - 基础 URL（用于拼接相对路径）
 * @returns {string} - 处理后的 HTML 字符串
 */
function resolveRelativeUrls(html, baseUrl) {
  // 确保 baseUrl 以 / 结尾，避免 new URL() 吃掉最后一段路径
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const urlAttrs = {
    img: ['src'],
    a: ['href'],
    link: ['href'],
    script: ['src'],
    source: ['src', 'srcset'],
    video: ['src'],
    audio: ['src'],
    iframe: ['src'],
    embed: ['src'],
    object: ['data'],
    track: ['src'],
  };

  for (const [tag, attrs] of Object.entries(urlAttrs)) {
    const elements = doc.querySelectorAll(tag);
    for (const el of elements) {
      for (const attr of attrs) {
        const value = el.getAttribute(attr);
        if (value && !isAbsoluteUrl(value)) {
          try {
            // new URL() 会把以 / 开头的路径当作相对于 origin 的绝对路径，
            // 所以需要去掉前导 / 让它相对于 baseUrl 解析
            const relative = value.startsWith('/') ? value.slice(1) : value;
            el.setAttribute(attr, new URL(relative, baseUrl).href);
          } catch (e) {
            // 无效 URL，跳过
          }
        }
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * 判断 URL 是否为绝对路径
 * @param {string} url
 * @returns {boolean}
 */
function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url) || url.startsWith('//') || url.startsWith('data:') || url.startsWith('#');
}

/**
 * HTML 转义
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 显示错误信息
 * @param {string} msg
 */
function showError(msg) {
  console.error('介绍：错误：', msg);

  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.textContent = '错误';
  document.title = '错误';

  const container = document.getElementById('intro-content');
  if (container) {
    container.innerHTML = `<div class="mdui-typo" style="color: #f00;"><p>${escapeHtml(msg)}</p></div>`;
  }
}