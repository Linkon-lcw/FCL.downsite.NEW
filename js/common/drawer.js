import { getFeedbackChannels } from '../repositories/siteRepository.js';
import { renderStatus } from '../views/commonView.js';
import { isSafeNavigationUrl } from '../security/content.js';

function createNavigationLink(label, href, iconName) {
  const link = document.createElement('a');
  link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
  link.href = href;
  const icon = document.createElement('i');
  icon.className = 'mdui-icon material-icons';
  icon.textContent = iconName;
  link.append(icon, document.createTextNode(` ${label}`));
  return link;
}

function createPanel(title, content) {
  const panelItem = document.createElement('div');
  panelItem.className = 'mdui-panel-item mdui-panel-item-open';
  const header = document.createElement('div');
  header.className = 'mdui-panel-item-header mdui-ripple';
  const label = document.createElement('div');
  label.textContent = title;
  const arrow = document.createElement('i');
  arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
  arrow.textContent = 'keyboard_arrow_down';
  const body = document.createElement('div');
  body.className = 'mdui-panel-item-body';
  body.append(...content);
  header.append(label, arrow);
  panelItem.append(header, body);
  return panelItem;
}

async function loadFeedback(container) {
  renderStatus(container, 'loading', { message: '正在加载反馈渠道……' });
  try {
    const feedbacks = await getFeedbackChannels();
    const links = feedbacks
      .filter((feedback) => isSafeNavigationUrl(feedback.href, { allowRelative: false }))
      .map((feedback) => {
        const link = createNavigationLink(`通过${feedback.name}`, feedback.href, 'feedback');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        return link;
      });
    if (links.length) container.replaceChildren(...links);
    else renderStatus(container, 'empty', { message: '暂无可用的反馈渠道' });
  } catch (error) {
    console.error('反馈渠道加载失败', error);
    renderStatus(container, 'error', { message: error.message, onRetry: () => loadFeedback(container) });
  }
}

function createDrawer() {
  const drawer = document.createElement('aside');
  drawer.className = 'mdui-drawer mdui-drawer-right mdui-container-fluid';
  drawer.setAttribute('aria-label', '网站导航');
  const panel = document.createElement('div');
  panel.className = 'mdui-panel';
  panel.setAttribute('mdui-panel', '');

  panel.appendChild(createPanel('网站导航', [
    createNavigationLink('资源列表', '/html/list.html', 'list'),
    createNavigationLink('赞助站长', '/html/sponsor.html', 'card_giftcard'),
    createNavigationLink('关于网站', '/html/about.html', 'people'),
  ]));
  panel.appendChild(createPanel('网站设置', [
    createNavigationLink('主题设置', '/html/theme.html', 'style'),
  ]));
  const feedbackContainer = document.createElement('div');
  panel.appendChild(createPanel('建议反馈', [feedbackContainer]));
  drawer.appendChild(panel);
  document.body.appendChild(drawer);
  document.body.classList.add('mdui-drawer-body-right');
  window.mdui.mutation();
  loadFeedback(feedbackContainer);
  return new window.mdui.Drawer(drawer);
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('menu_btn');
  if (!button) return;
  let drawerInstance = null;
  button.addEventListener('click', () => {
    if (!drawerInstance) drawerInstance = createDrawer();
    drawerInstance.toggle();
  });
});
