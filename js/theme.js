import utils from './module/utils.js';

document.addEventListener('DOMContentLoaded', function () {
  const theme = utils.readLocalStorage('fdn-theme');
  const primary = utils.readLocalStorage('fdn-theme-primary');
  const accent = utils.readLocalStorage('fdn-theme-accent');

  // 恢复单选框状态
  restoreRadioState('theme-select', 'theme-layout', theme || 'auto');
  restoreRadioState('primary-select', 'theme-primary', primary || 'teal');
  restoreRadioState('accent-select', 'theme-accent', accent || 'green');

  applyTheme();

  // 绑定事件监听
  bindRadioEvent('theme-select', 'theme-layout', 'fdn-theme');
  bindRadioEvent('primary-select', 'theme-primary', 'fdn-theme-primary');
  bindRadioEvent('accent-select', 'theme-accent', 'fdn-theme-accent');
});

/**
 * 恢复单选框选中状态
 * @param {string} containerId - 单选框容器 ID
 * @param {string} name - 单选框名称
 * @param {string} value - 单选框值
 */
function restoreRadioState(containerId, name, value) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const radio = container.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);
  if (radio) {
    radio.checked = true;
  }
}

/**
 * 绑定单选框 change 事件
 * @param {string} containerId - 单选框容器 ID
 * @param {string} name - 单选框名称
 * @param {string} storageKey - 本地存储键
 */
function bindRadioEvent(containerId, name, storageKey) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener('change', function (e) {
    if (e.target.type === 'radio' && e.target.name === name) {
      utils.writeLocalStorage(storageKey, e.target.value);
      applyTheme();
    }
  });
}

/**
 * 应用主题：移除所有旧主题类，添加新主题类
 */
function applyTheme() {
  const theme = utils.readLocalStorage('fdn-theme');
  const primary = utils.readLocalStorage('fdn-theme-primary');
  const accent = utils.readLocalStorage('fdn-theme-accent');

  const doc = document.body;

  // 收集并移除所有 mdui-theme-* 类
  const classesToRemove = [];
  for (const cls of doc.classList) {
    if (cls.startsWith('mdui-theme-')) {
      classesToRemove.push(cls);
    }
  }
  classesToRemove.forEach(cls => doc.classList.remove(cls));

  // 应用新主题
  const themeVal = theme || 'auto';
  const primaryVal = primary || 'teal';
  const accentVal = accent || 'green';

  doc.classList.add(`mdui-theme-layout-${themeVal}`);
  doc.classList.add(`mdui-theme-primary-${primaryVal}`);
  doc.classList.add(`mdui-theme-accent-${accentVal}`);

  // 保存默认值
  if (!theme) utils.writeLocalStorage('fdn-theme', 'auto');
  if (!primary) utils.writeLocalStorage('fdn-theme-primary', 'teal');
  if (!accent) utils.writeLocalStorage('fdn-theme-accent', 'green');

  console.log(`主题：${themeVal}，主色：${primaryVal}，强调色：${accentVal}`);
}