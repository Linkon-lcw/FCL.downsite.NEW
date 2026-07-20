import { renderStatus, setErrorTitle, setSoftwareHeader } from './commonView.js';
import { isSafeNavigationUrl } from '../security/content.js';

export function renderDetailLoading(elements) {
  renderTableStatus(elements.body, 'loading', '正在加载软件详情……');
}

export function renderDetailError(elements, error, onRetry) {
  setErrorTitle();
  renderTableStatus(elements.body, 'error', error.message, onRetry);
  elements.operations.hidden = true;
}

function renderTableStatus(body, state, message, onRetry) {
  const row = document.createElement('tr');
  const label = document.createElement('td');
  const content = document.createElement('td');
  label.textContent = state === 'error' ? '错误' : '状态';
  renderStatus(content, state, { message, onRetry });
  row.append(label, content);
  body.replaceChildren(row);
}

export function renderDetail(elements, id, basic, detail, tags) {
  setSoftwareHeader(basic);
  elements.operations.hidden = false;
  const tagMap = new Map(tags.map((tag) => [tag.id, tag.name]));
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
  elements.history.href = `/html/rh.html?id=${id}`;
  if (isSafeNavigationUrl(detail.releaseHistoryUrl, { allowRelative: false })) {
    elements.history.dataset.releaseHistoryUrl = detail.releaseHistoryUrl;
  }
}

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

function createInfoValue(item) {
  if (!item.href || !isSafeNavigationUrl(item.href)) return item.text || item.href || '';
  const link = document.createElement('a');
  link.href = item.href;
  link.textContent = item.text || item.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}
