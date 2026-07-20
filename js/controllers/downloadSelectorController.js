import { adaptDownloadData, randomlySelectDefault } from '../adapters/download/index.js';
import { loadDescription, loadDownloadNodes } from '../repositories/downloadRepository.js';
import { createSafeContent } from '../security/content.js';
import { createSelectorView } from '../views/selectorView.js';

function isBottomLevel(items) {
  return !items.some((item) =>
    (Array.isArray(item.children) && item.children.length)
    || item.nextUrl
    || (Array.isArray(item.items) && item.items.length));
}

export function createDownloadSelectorController(options) {
  const view = createSelectorView(options.container, options.stopButton, options.matchedArchitecture);
  let activeController = null;
  let requestSequence = 0;
  let softwareName = options.softwareName;

  function isCurrent(sequence) {
    return sequence === requestSequence && !activeController?.signal.aborted;
  }

  async function renderDescription(item, container, signal, sequence) {
    if (!item.description && !item.descriptionUrl) {
      container.replaceChildren();
      return;
    }
    try {
      const content = item.descriptionUrl
        ? await loadDescription(item.descriptionUrl, signal)
        : item.description;
      if (!isCurrent(sequence)) return;
      if (item.descriptionFormat === 'html') {
        const fragment = await createSafeContent(content, { type: 'html', baseUrl: item.descriptionUrl });
        if (isCurrent(sequence)) container.replaceChildren(fragment);
      } else {
        container.textContent = content;
      }
    } catch (error) {
      if (error.kind !== 'abort' && isCurrent(sequence)) container.textContent = `描述加载失败：${error.message}`;
    }
  }

  function normalizeInlineChildren(item) {
    let children = item.children || item.items || [];
    if (item.apiVersion) {
      children = adaptDownloadData(children, item.apiVersion, { source: item.sourceName || item.name });
    }
    return item.random ? randomlySelectDefault(children) : children;
  }

  async function resolveSelection(item, nextLevel, inheritedFilter, signal, sequence) {
    const nextFilter = item.filter !== undefined ? item.filter : inheritedFilter;
    let nodes;
    if (item.nextUrl || (item.apiVersion && !item.children && !item.items)) {
      nodes = await loadDownloadNodes({
        url: item.nextUrl,
        apiVersion: item.apiVersion,
        softwareName,
        sourceName: item.sourceName || item.name,
        random: item.random,
        signal,
      });
    } else if (item.children || item.items) {
      nodes = normalizeInlineChildren(item);
    } else if (item.downloadUrl) {
      nodes = [item];
    } else {
      nodes = [];
    }
    if (!isCurrent(sequence)) return;
    renderNodes(nodes, nextLevel, nextFilter);
  }

  async function selectItem(item, level, description, inheritedFilter) {
    options.container.querySelector('.xf-cancel-notice')?.remove();
    activeController?.abort();
    activeController = new AbortController();
    const sequence = ++requestSequence;
    view.clearFrom(level + 1);
    view.setBusy(true);
    if (item.nameIsSoftware) softwareName = item.name;

    const retry = () => selectItem(item, level, description, inheritedFilter);
    try {
      await Promise.all([
        renderDescription(item, description, activeController.signal, sequence),
        resolveSelection(item, level + 1, inheritedFilter, activeController.signal, sequence),
      ]);
    } catch (error) {
      if (error.kind !== 'abort' && isCurrent(sequence)) {
        console.error('下载选项加载失败', error);
        view.renderError(level + 1, error, retry);
      }
    } finally {
      if (isCurrent(sequence)) view.setBusy(false);
    }
  }

  function renderNodes(items, level, inheritedFilter) {
    if (!Array.isArray(items)) {
      view.renderError(level, new Error('镜像数据格式不正确：应为数组'));
      return;
    }
    if (isBottomLevel(items)) {
      view.renderDownloads(items, level, inheritedFilter, options.onDownload);
      return;
    }
    view.renderSelect(items, level, (item, description) => {
      selectItem(item, level, description, inheritedFilter);
    });
  }

  function start() {
    renderNodes(options.dataSource, 0);
  }

  function abort() {
    requestSequence += 1;
    activeController?.abort();
    activeController = null;
    view.setBusy(false);
    const notice = document.createElement('p');
    notice.className = 'xf-status xf-status-idle xf-cancel-notice';
    notice.textContent = '已终止当前加载，可重新选择线路。';
    options.container.appendChild(notice);
  }

  options.stopButton?.addEventListener('click', abort);
  return { abort, start };
}
