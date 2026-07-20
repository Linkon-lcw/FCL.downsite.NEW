import { renderStatus, setErrorTitle, setSoftwareHeader } from './commonView.js';

export function renderIntroLoading(container) {
  renderStatus(container, 'loading', { message: '正在加载介绍文档列表……' });
}

export function renderIntroError(container, error, onRetry) {
  setErrorTitle();
  renderStatus(container, 'error', { message: error.message, onRetry });
}

export function renderIntroPanels(container, basic, items, onOpen) {
  setSoftwareHeader(basic, {
    titlePrefix: '介绍',
    detailButton: document.getElementById('detailBtn'),
  });
  if (!items.length) {
    renderStatus(container, 'empty', { message: '暂无介绍文档' });
    return;
  }

  const fragment = document.createDocumentFragment();
  // 这里只创建折叠外壳；正文请求由 header 点击后的 onOpen 回调延后触发。
  items.forEach((item, index) => {
    const panel = document.createElement('div');
    panel.className = 'mdui-panel';
    panel.setAttribute('mdui-panel', '');
    const panelItem = document.createElement('div');
    panelItem.className = 'mdui-panel-item';
    const header = document.createElement('div');
    header.className = 'mdui-panel-item-header mdui-ripple';
    const title = document.createElement('div');
    title.textContent = item.title || `文档 ${index + 1}`;
    const arrow = document.createElement('i');
    arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
    arrow.textContent = 'keyboard_arrow_down';
    const body = document.createElement('div');
    body.className = 'mdui-panel-item-body mdui-typo';
    // 空闲提示能让用户理解首次展开可能需要等待，而不是误以为内容丢失。
    renderStatus(body, 'idle', { message: '展开后加载正文' });
    header.append(title, arrow);
    panelItem.append(header, body);
    panel.appendChild(panelItem);
    header.addEventListener('click', () => onOpen(item, body));
    fragment.appendChild(panel);
  });
  container.replaceChildren(fragment);
  // 动态插入的面板需要通知 MDUI 重新扫描 data 属性。
  window.mdui?.mutation();
}

export function renderDocumentLoading(container) {
  renderStatus(container, 'loading', { message: '正在加载文档……' });
}

export function renderDocument(container, fragment) {
  container.replaceChildren(fragment);
  window.mdui?.mutation();
}

export function renderDocumentError(container, error, onRetry) {
  renderStatus(container, 'error', { message: `文档加载失败：${error.message}`, onRetry });
}
