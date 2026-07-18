import utils from './module/utils.js';
import { applyTheme } from './module/theme.js';

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

