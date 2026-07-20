export function clearElement(element) {
  element?.replaceChildren();
}

export function renderStatus(container, state, { message = '', onRetry } = {}) {
  // 所有动态页统一使用这五类状态，避免不同页面分别拼接不安全的错误 HTML。
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = `xf-status xf-status-${state}`;
  wrapper.setAttribute('role', state === 'error' ? 'alert' : 'status');

  if (state === 'loading') {
    // 加载态才创建 MDUI spinner，其他状态只输出可读文本。
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
    // 重试监听器使用 once：点击后由 controller 重新渲染，旧按钮不应再响应第二次。
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
  // 下载页、介绍页和详情页共用标题栏更新逻辑，减少路径和 alt 文案不一致。
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
  // 只接受非负整数字符串，拒绝 parseInt 会误接受的 "1abc" 等输入。
  const rawId = new URLSearchParams(window.location.search).get('id');
  if (rawId === null || !/^\d+$/.test(rawId)) return null;
  return Number(rawId);
}
