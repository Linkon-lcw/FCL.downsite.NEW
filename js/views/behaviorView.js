import { renderStatus } from './commonView.js';

/**
 * 行为设置页面 view。
 * 负责渲染下拉选择器、恢复已保存的偏好值、显示保存状态的反馈。
 */

/** 默认打开方式的可选项列表。 */
export const OPEN_METHOD_OPTIONS = [
  { value: 'detail', label: '详情页' },
  { value: 'download', label: '下载页' },
  { value: 'doc', label: '文档页' },
  { value: 'history', label: '版本历史页' },
];

/** 默认选中的值。 */
export const DEFAULT_OPEN_METHOD = 'detail';

/**
 * 将下拉选择器设置为指定值。
 * @param {HTMLSelectElement} selectEl - 下拉选择器元素
 * @param {string} value - 要设置的值
 */
export function setSelectValue(selectEl, value) {
  if (!selectEl) return;
  const validValues = OPEN_METHOD_OPTIONS.map((opt) => opt.value);
  if (!validValues.includes(value)) {
    console.warn(`无效的打开方式值: ${value}，使用默认值`);
    selectEl.value = DEFAULT_OPEN_METHOD;
    return;
  }
  selectEl.value = value;
  // 通知 MDUI 更新 select 组件显示
  window.mdui?.mutation();
}

/**
 * 渲染加载状态。
 * @param {HTMLElement} container - 挂载容器
 */
export function renderBehaviorLoading(container) {
  renderStatus(container, 'loading', { message: '正在加载设置……' });
}

/**
 * 渲染错误状态。
 * @param {HTMLElement} container - 挂载容器
 * @param {Error} error - 错误对象
 * @param {Function} onRetry - 重试回调
 */
export function renderBehaviorError(container, error, onRetry) {
  renderStatus(container, 'error', { message: error.message || '设置加载失败', onRetry });
}

/**
 * 显示保存成功的提示。
 * @param {string} message - 提示文本
 */
export function showSaveSuccess(message) {
  window.mdui?.snackbar({
    message: message || '设置已保存',
    timeout: 2000,
  });
}

/**
 * 显示保存失败的提示。
 * @param {string} message - 错误提示文本
 */
export function showSaveError(message) {
  window.mdui?.snackbar({
    message: message || '设置保存失败，请重试',
    timeout: 3000,
  });
}