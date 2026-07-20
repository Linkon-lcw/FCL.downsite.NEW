import { inferArchitecture } from '../domain/systemInfo.js';
import { isSafeNavigationUrl } from '../security/content.js';
import { renderStatus } from './commonView.js';

const COLUMN_DEFINITIONS = [
  ['操作', 'action'],
  ['架构', 'architecture'],
  ['描述', 'description'],
  ['大小', 'size'],
  ['显示名称', 'name'],
  ['URL', 'url'],
];

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return '';
  if (Number(bytes) === 0) return '0 Bytes';
  const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  const index = Math.min(Math.floor(Math.log(Number(bytes)) / Math.log(1024)), units.length - 1);
  return `${Number((Number(bytes) / (1024 ** index)).toFixed(2))} ${units[index]}`;
}

function createLevel(container, level) {
  const section = document.createElement('section');
  section.dataset.selectorLevel = String(level);
  container.appendChild(section);
  return section;
}

export function createSelectorView(container, stopButton, matchedArchitecture) {
  function clearFrom(level) {
    container.querySelectorAll('[data-selector-level]').forEach((element) => {
      if (Number(element.dataset.selectorLevel) >= level) element.remove();
    });
  }

  function setBusy(busy) {
    container.querySelectorAll('select, button, a').forEach((control) => {
      if ('disabled' in control) control.disabled = busy;
      control.classList.toggle('disabled', busy);
    });
    stopButton?.classList.toggle('xf-hide', !busy);
  }

  function renderSelect(items, level, onSelect) {
    clearFrom(level);
    const section = createLevel(container, level);
    const select = document.createElement('select');
    select.className = 'mdui-select mdui-block';
    select.setAttribute('aria-label', `下载选项第 ${level + 1} 级`);
    items.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = item.name || '(无名称)';
      select.appendChild(option);
    });
    const description = document.createElement('div');
    description.className = 'description';
    section.append(select, description);
    select.addEventListener('change', () => onSelect(items[Number(select.value)], description));
    window.mdui?.mutation();

    const defaultIndex = items.findIndex((item) => item.default === true);
    select.value = String(defaultIndex >= 0 ? defaultIndex : 0);
    queueMicrotask(() => onSelect(items[Number(select.value)], description));
  }

  function renderDownloads(items, level, filter, onDownload) {
    clearFrom(level);
    const section = createLevel(container, level);
    const validItems = items.filter((item) => item.downloadUrl && isSafeNavigationUrl(item.downloadUrl, { allowRelative: false }));
    if (!validItems.length) {
      renderStatus(section, 'empty', { message: '该选项暂无可用的下载地址' });
      return;
    }

    const rows = validItems.map((item) => {
      const architecture = inferArchitecture(item);
      return {
        item,
        architecture,
        hidden: Array.isArray(filter) && filter.length > 0
          && !filter.some((pattern) => new RegExp(pattern).test(item.downloadUrl)),
        values: {
          architecture,
          description: item.description || '',
          size: formatBytes(item.size),
          name: item.name || '',
          url: item.downloadUrl,
        },
      };
    });
    const visibleColumns = COLUMN_DEFINITIONS.filter(([, key]) => key === 'action' || rows.some((row) => row.values[key]));
    const wrapper = document.createElement('div');
    wrapper.className = 'mdui-table-fluid';
    const table = document.createElement('table');
    table.className = 'mdui-table download-buttons-container';
    const header = document.createElement('tr');
    visibleColumns.forEach(([label]) => {
      const cell = document.createElement('th');
      cell.textContent = label;
      header.appendChild(cell);
    });
    const thead = document.createElement('thead');
    thead.appendChild(header);
    const tbody = document.createElement('tbody');

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      if (row.hidden) tr.classList.add('xf-filter-hidden');
      if (row.architecture && row.architecture === matchedArchitecture) tr.classList.add('xf-matched-arch');
      visibleColumns.forEach(([, key]) => {
        const cell = document.createElement('td');
        if (key === 'action') {
          const link = document.createElement('a');
          link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
          link.href = row.item.downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = row.item.available === false ? '暂不可用' : '下载';
          if (row.item.available === false) {
            link.classList.add('disabled');
            link.setAttribute('aria-disabled', 'true');
            link.addEventListener('click', (event) => event.preventDefault());
          } else if (onDownload) {
            link.addEventListener('click', (event) => onDownload(row.item, event));
          }
          cell.appendChild(link);
        } else if (key === 'url') {
          const link = document.createElement('a');
          link.href = row.item.downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = row.item.downloadUrl;
          cell.className = 'mdui-typo';
          cell.appendChild(link);
        } else {
          cell.textContent = row.values[key];
        }
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    wrapper.appendChild(table);

    if (matchedArchitecture && rows.some((row) => row.architecture === matchedArchitecture)) {
      const note = document.createElement('p');
      note.className = 'description';
      note.textContent = '已匹配当前架构，请留意绿色行（仅供参考，安装失败时请选择 all 架构）。';
      section.appendChild(note);
    }

    const hiddenCount = rows.filter((row) => row.hidden).length;
    if (hiddenCount) {
      const show = document.createElement('button');
      show.type = 'button';
      show.className = 'mdui-btn mdui-btn-raised mdui-ripple mdui-block';
      show.textContent = `显示 ${hiddenCount} 个被筛选条件隐藏的项目`;
      show.addEventListener('click', () => {
        tbody.querySelectorAll('.xf-filter-hidden').forEach((row) => row.classList.remove('xf-filter-hidden'));
        show.remove();
      }, { once: true });
      section.appendChild(show);
    }
    section.appendChild(wrapper);
    window.mdui?.mutation();
  }

  function renderError(level, error, onRetry) {
    clearFrom(level);
    const section = createLevel(container, level);
    renderStatus(section, 'error', { message: error.message, onRetry });
  }

  return { clearFrom, renderDownloads, renderError, renderSelect, setBusy };
}
