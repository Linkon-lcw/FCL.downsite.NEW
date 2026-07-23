import { formatBytes, renderStatus, setErrorTitle, setSoftwareHeader } from './commonView.js';
import { createSafeContent } from '../security/content.js';

/** 版本历史首屏加载状态。 */
export function renderRhLoading(container) {
  renderStatus(container, 'loading', { message: '正在加载版本历史……' });
}

/** 版本历史加载失败。 */
export function renderRhError(container, error, onRetry) {
  setErrorTitle();
  renderStatus(container, 'error', { message: error.message, onRetry });
}

/**
 * 渲染所有 Release 折叠面板。
 * @param {HTMLElement} container 挂载容器
 * @param {object} basic 软件目录项
 * @param {Array} releases GitHub API 返回的 Release 数组
 */
export async function renderReleases(container, basic, releases) {
  setSoftwareHeader(basic, {
    titlePrefix: '版本历史 - ',
    detailButton: document.getElementById('detailBtn'),
  });

  if (!releases.length) {
    renderStatus(container, 'empty', { message: '暂无版本记录' });
    return;
  }

  container.replaceChildren();

  const panel = document.createElement('div');
  panel.className = 'mdui-panel';
  panel.setAttribute('mdui-panel', '');

  // 使用 DocumentFragment 批量处理 DOM 操作
  const fragment = document.createDocumentFragment();

  // 表头
  fragment.appendChild(createHeaderItem());

  for (let index = 0; index < releases.length; index++) {
    const release = releases[index];
    const panelItem = document.createElement('div');
    panelItem.className = `mdui-panel-item${index === 0 ? ' mdui-panel-item-open' : ''}`;

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'mdui-panel-item-header mdui-ripple';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'mdui-panel-item-title';
    titleDiv.textContent = release.name || '未命名版本';

    const tagDiv = document.createElement('div');
    tagDiv.className = 'mdui-panel-item-summary';
    tagDiv.textContent = release.tag_name;

    const dateDiv = document.createElement('div');
    dateDiv.className = 'mdui-panel-item-summary';
    try {
      dateDiv.textContent = new Date(release.published_at).toLocaleString();
    } catch (_) {
      dateDiv.textContent = release.published_at || '';
    }

    const arrow = document.createElement('i');
    arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
    arrow.textContent = 'keyboard_arrow_down';

    header.append(titleDiv, tagDiv, dateDiv, arrow);

    // --- Body ---
    const body = document.createElement('div');
    body.className = 'mdui-panel-item-body';

    // 子面板
    const subPanel = document.createElement('div');
    subPanel.className = 'mdui-panel';
    subPanel.setAttribute('mdui-panel', '');

    // 内容子面板项
    const contentPanel = createContentSection(release.body);
    subPanel.appendChild(contentPanel);

    // 资源子面板项
    const assetsPanel = createAssetsSection(release.assets);
    subPanel.appendChild(assetsPanel);

    body.appendChild(subPanel);

    panelItem.append(header, body);
    fragment.appendChild(panelItem);
  }

  panel.appendChild(fragment);
  container.appendChild(panel);
  window.mdui?.mutation();
}

/** 创建表头面板项：版本名称 / 版本Tag / 发布时间。 */
function createHeaderItem() {
  const headerItem = document.createElement('div');
  headerItem.className = 'mdui-panel-item';

  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';

  const title = document.createElement('div');
  title.className = 'mdui-panel-item-title';
  title.textContent = '版本名称';

  const tag = document.createElement('div');
  tag.className = 'mdui-panel-item-summary';
  tag.textContent = '版本Tag';

  const date = document.createElement('div');
  date.className = 'mdui-panel-item-summary';
  date.textContent = '发布时间';

  header.append(title, tag, date);

  const body = document.createElement('div');
  body.className = 'mdui-panel-item-body mdui-typo';
  const hint = document.createElement('p');
  hint.className = 'mdui-typo';
  hint.textContent = '我是表头呐~';
  body.appendChild(hint);

  headerItem.append(header, body);
  return headerItem;
}

/** 创建 Release 正文的折叠子面板。 */
function createContentSection(body) {
  const panelItem = document.createElement('div');
  panelItem.className = 'mdui-panel-item mdui-panel-item-open';

  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';

  const title = document.createElement('div');
  title.className = 'mdui-panel-item-title';
  title.textContent = '内容';

  const contentArrow = document.createElement('i');
  contentArrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
  contentArrow.textContent = 'keyboard_arrow_down';

  header.append(title, contentArrow);

  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'mdui-panel-item-body';

  // 先显示加载状态，再异步渲染 Markdown
  const contentDiv = document.createElement('div');
  contentDiv.className = 'mdui-typo';
  renderStatus(contentDiv, 'loading', { message: '正在渲染正文……' });
  bodyContainer.appendChild(contentDiv);

  panelItem.append(header, bodyContainer);

  // 异步渲染 Markdown 正文
  renderReleaseBody(contentDiv, body);

  return panelItem;
}

/** 异步渲染 Release 正文。 */
async function renderReleaseBody(container, body) {
  try {
    const fragment = await createSafeContent(body || '无发布说明', { type: 'md' });
    container.replaceChildren(fragment);
  } catch (error) {
    console.error('Release 正文渲染失败', error);
    renderStatus(container, 'error', {
      message: `正文渲染失败：${error.message}`,
      onRetry: () => renderReleaseBody(container, body),
    });
  }
}

/** 创建资源列表的折叠子面板。 */
function createAssetsSection(assets) {
  const panelItem = document.createElement('div');
  panelItem.className = 'mdui-panel-item';

  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';

  const title = document.createElement('div');
  title.className = 'mdui-panel-item-title';
  title.textContent = `资源（${assets.length}）`;

  const assetsArrow = document.createElement('i');
  assetsArrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
  assetsArrow.textContent = 'keyboard_arrow_down';

  header.append(title, assetsArrow);

  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'mdui-panel-item-body';

  if (assets.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'mdui-typo';
    emptyDiv.textContent = '无资源';
    bodyContainer.appendChild(emptyDiv);
  } else {
    // 资源列表改为面板嵌套
    const innerPanel = document.createElement('div');
    innerPanel.className = 'mdui-panel';
    innerPanel.setAttribute('mdui-panel', '');

    const fragment = document.createDocumentFragment();
    assets.forEach((asset) => {
      fragment.appendChild(createAssetPanel(asset));
    });
    fragment.appendChild(createSummaryPanel(assets));
    innerPanel.appendChild(fragment);
    bodyContainer.appendChild(innerPanel);
  }

  panelItem.append(header, bodyContainer);
  return panelItem;
}

/** 创建单个资源的面板项，内容以表格展示。 */
function createAssetPanel(asset) {
  const panelItem = document.createElement('div');
  panelItem.className = 'mdui-panel-item';

  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';

  const title = document.createElement('div');
  title.className = 'mdui-panel-item-title';
  title.textContent = asset.name;

  const arrow = document.createElement('i');
  arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
  arrow.textContent = 'keyboard_arrow_down';

  header.append(title, arrow);

  const body = document.createElement('div');
  body.className = 'mdui-panel-item-body mdui-typo';

  const fluid = document.createElement('div');
  fluid.className = 'mdui-table-fluid';

  const table = document.createElement('table');
  table.className = 'mdui-table';

  const tbody = document.createElement('tbody');
  addTableRow(tbody, '大小', formatBytes(asset.size));
  addTableRow(tbody, 'GH下载URL', asset.browser_download_url, asset.browser_download_url);
  table.appendChild(tbody);

  fluid.appendChild(table);
  body.appendChild(fluid);
  panelItem.append(header, body);
  return panelItem;
}

/** 创建合计面板项，内容以表格展示。 */
function createSummaryPanel(assets) {
  const totalSize = assets.reduce((sum, asset) => sum + (asset.size || 0), 0);
  const allUrls = assets.map((asset) => asset.browser_download_url).filter(Boolean);

  const panelItem = document.createElement('div');
  panelItem.className = 'mdui-panel-item';

  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';

  const title = document.createElement('div');
  title.className = 'mdui-panel-item-title';
  title.textContent = '合计';

  const arrow = document.createElement('i');
  arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
  arrow.textContent = 'keyboard_arrow_down';

  header.append(title, arrow);

  const body = document.createElement('div');
  body.className = 'mdui-panel-item-body';

  const fluid = document.createElement('div');
  fluid.className = 'mdui-table-fluid';

  const table = document.createElement('table');
  table.className = 'mdui-table';

  const tbody = document.createElement('tbody');
  addTableRow(tbody, '总大小', formatBytes(totalSize));
  addTableRow(tbody, '所有下载URL', allUrls.join('\n'));
  table.appendChild(tbody);

  fluid.appendChild(table);
  body.appendChild(fluid);
  panelItem.append(header, body);
  return panelItem;
}

/** 向表格 tbody 添加一行。label 为文本，value 为纯文本或链接文本，href 可选。 */
function addTableRow(tbody, label, value, href) {
  const row = document.createElement('tr');
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  const valueCell = document.createElement('td');
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = value;
    valueCell.appendChild(link);
  } else {
    const pre = document.createElement('p');
    pre.textContent = value;
    valueCell.appendChild(pre);
  }
  row.append(labelCell, valueCell);
  tbody.appendChild(row);
}