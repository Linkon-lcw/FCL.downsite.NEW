import { renderStatus, setErrorTitle, setSoftwareHeader } from './commonView.js';
import { isSafeNavigationUrl } from '../security/content.js';

/** 将详情表格置为加载状态，仍遵守 tbody 只能包含 tr 的 HTML 结构。 */
export function renderDetailLoading(elements) {
  renderTableStatus(elements.body, 'loading', '正在加载软件详情……');
}

/** 展示详情错误并隐藏依赖有效软件 ID 的操作按钮区。 */
export function renderDetailError(elements, error, onRetry) {
  setErrorTitle();
  renderTableStatus(elements.body, 'error', error.message, onRetry);
  elements.operations.hidden = true;
}

function renderTableStatus(body, state, message, onRetry) {
  // tbody 只能直接放 tr，不能把通用 div 状态组件直接插入表格。
  const row = document.createElement('tr');
  const label = document.createElement('td');
  const content = document.createElement('td');
  label.textContent = state === 'error' ? '错误' : '状态';
  renderStatus(content, state, { message, onRetry });
  row.append(label, content);
  body.replaceChildren(row);
}

/**
 * 渲染完整详情表。
 * basic 来自软件目录；detail.info 是可选的补充字段数组；
 * tags 用于将 basic.tagIds 从数字翻译为人可读名称。
 */
export function renderDetail(elements, id, basic, detail, tags) {
  setSoftwareHeader(basic);
  elements.operations.hidden = false;
  const tagMap = new Map(tags.map((tag) => [tag.id, tag.name]));
  // value 可以是字符串，也可以是受本 view 创建的安全 DOM 节点（图标或外链）。
  const rows = [
    ['名称', basic.name],
    ['图标', createIcon(basic)],
    ['ID', String(id)],
    ['TAG', basic.tagIds.map((tagId) => tagMap.get(tagId) || String(tagId)).join(', ')],
  ];
  (detail.info || []).forEach((item) => rows.push([item.name, createInfoValue(item)]));

  const fragment = document.createDocumentFragment();
  rows.forEach(([name, value]) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const valueCell = document.createElement('td');
    nameCell.textContent = name;
    if (value instanceof Node) valueCell.appendChild(value);
    else valueCell.textContent = value;
    row.append(nameCell, valueCell);
    fragment.appendChild(row);
  });
  elements.body.replaceChildren(fragment);

  elements.download.href = `/html/down.html?id=${id}`;
  elements.intro.href = `/html/intro.html?id=${id}`;
  // rh.html 是预留入口，不能因为当前未实现就移除；原始历史 API 地址供未来页面读取。
  elements.history.href = `/html/rh.html?id=${id}`;
  if (isSafeNavigationUrl(detail.releaseHistoryUrl, { allowRelative: false })) {
    elements.history.dataset.releaseHistoryUrl = detail.releaseHistoryUrl;
  }
}

/** 创建详情内的惰性图标节点；尺寸固定可减少表格首次渲染的布局变化。 */
function createIcon(basic) {
  const image = document.createElement('img');
  image.src = basic.icon;
  image.alt = basic.name;
  image.className = 'xf-detail-icon';
  image.width = 64;
  image.height = 64;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

/** 将 detail.info 的一项转为纯文本或安全外链节点。 */
function createInfoValue(item) {
  // 外部信息链接经过协议校验，并明确隔离新窗口的 opener。
  if (!item.href || !isSafeNavigationUrl(item.href)) return item.text || item.href || '';
  const link = document.createElement('a');
  link.href = item.href;
  link.textContent = item.text || item.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}
