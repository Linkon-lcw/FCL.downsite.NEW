export function clearElement(element) {
  element?.replaceChildren();
}

export function renderStatus(container, state, { message = '', onRetry } = {}) {
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = `xf-status xf-status-${state}`;
  wrapper.setAttribute('role', state === 'error' ? 'alert' : 'status');

  if (state === 'loading') {
    const spinner = document.createElement('div');
    spinner.className = 'mdui-spinner';
    wrapper.appendChild(spinner);
  }

  const text = document.createElement('p');
  text.textContent = message || ({
    idle: '等待加载',
    loading: '正在加载……',
    empty: '暂无内容',
    error: '加载失败',
  }[state] || '');
  wrapper.appendChild(text);

  if (state === 'error' && onRetry) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'mdui-btn mdui-btn-raised mdui-ripple';
    retry.textContent = '重试';
    retry.addEventListener('click', onRetry, { once: true });
    wrapper.appendChild(retry);
  }
  container.replaceChildren(wrapper);
}

export function setSoftwareHeader(basic, { titlePrefix = '', detailButton } = {}) {
  const icon = document.getElementById('icon');
  const title = document.getElementById('title');
  const pageTitle = `${titlePrefix}${basic.name}`;
  if (icon) {
    icon.src = basic.icon;
    icon.alt = basic.name;
  }
  if (title) title.textContent = pageTitle;
  document.title = pageTitle;
  if (detailButton) detailButton.href = `/html/detail.html?id=${basic.id}`;
}

export function setErrorTitle() {
  const title = document.getElementById('title');
  if (title) title.textContent = '错误';
  document.title = '错误';
}

export function getSoftwareId() {
  const rawId = new URLSearchParams(window.location.search).get('id');
  if (rawId === null || !/^\d+$/.test(rawId)) return null;
  return Number(rawId);
}
