import { getFeedbackChannels } from '../repositories/siteRepository.js';
import { renderStatus } from '../views/commonView.js';
import { isSafeNavigationUrl } from '../security/content.js';

/**
 * 所有页面共用的右侧抽屉。
 * 本模块只在页面存在 #menu_btn 时工作；窄屏下创建抽屉推迟到首次点击，宽屏则立即创建以适配 MDUI 持久展开。
 */

/** 创建本站固定导航链接；label 是按钮文案，iconName 是 Material Icons 名称。 */
function createNavigationLink(label, href, iconName, target) {
  // 所有抽屉链接通过 DOM API 创建，避免反馈渠道名称进入 HTML 字符串插值。
  const link = document.createElement('a');
  link.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
  link.href = href;
  if (target) link.target = target;
  const icon = document.createElement('i');
  icon.className = 'mdui-icon material-icons';
  icon.textContent = iconName;
  link.append(icon, document.createTextNode(` ${label}`));
  return link;
}

/** 创建一个打开状态的 MDUI 面板项，content 为已创建好的 DOM 子节点数组。 */
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

/**
 * 将 data/feedback.json 转为外链按钮。
 * 无效 URL 会被过滤；请求失败只替换反馈区域，不影响抽屉的本地导航。
 */
async function loadFeedback(container) {
  // 反馈渠道不是首屏必须内容；抽屉首次打开后才会调用此函数。
  renderStatus(container, 'loading', { message: '正在加载反馈渠道……' });
  try {
    const feedbacks = await getFeedbackChannels();
    const links = feedbacks
      // 配置数据也必须校验，禁止误填 javascript: 等危险协议。
      .filter((feedback) => isSafeNavigationUrl(feedback.href, { allowRelative: false }))
      .map((feedback) => {
        const link = createNavigationLink(`通过 ${feedback.name}`, feedback.href, 'feedback');
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

/** 创建、挂载并初始化抽屉，返回 MDUI 的 Drawer 实例供后续 toggle 调用。 */
function createDrawer() {
  // 抽屉 DOM 延迟到用户首次点击菜单才创建，普通页面加载不会请求 feedback.json。
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
  panel.appendChild(createPanel('网站信息', [
    createNavigationLink('2026 XIAOLUOFOXINGTON', '#', 'copyright'),
    createNavigationLink('新ICP备2024015133号-7', 'https://beian.miit.gov.cn', 'beenhere', '_blank'),
  ]));
  drawer.appendChild(panel);
  document.body.appendChild(drawer);
  document.body.classList.add('mdui-drawer-body-right');
  window.mdui.mutation();
  // 创建外壳后异步填充反馈区；失败不会影响导航、设置等本地链接。
  loadFeedback(feedbackContainer);
  return new window.mdui.Drawer(drawer);
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('menu_btn');
  if (!button) return;

  const MDUI_LG_BREAKPOINT = 1024;
  const isWideScreen = () => window.innerWidth >= MDUI_LG_BREAKPOINT;

  // 保留单例，后续开关不重复创建 DOM 或再次请求反馈数据。
  let drawerInstance = null;

  const ensureDrawer = () => {
    if (!drawerInstance) drawerInstance = createDrawer();
    return drawerInstance;
  };

  // 宽屏下 MDUI 抽屉默认展开，必须立即创建 DOM；窄屏仍保持懒加载。
  if (isWideScreen()) ensureDrawer();

  button.addEventListener('click', () => {
    ensureDrawer().toggle();
  });

  // 窄屏 → 宽屏切换时，若抽屉尚未创建则自动创建，避免宽屏下抽屉区域空白。
  let wasWide = isWideScreen();
  window.addEventListener('resize', () => {
    const nowWide = isWideScreen();
    if (!wasWide && nowWide) ensureDrawer();
    wasWide = nowWide;
  });
});
