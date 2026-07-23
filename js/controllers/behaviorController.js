import { readPreference, writePreference } from '../domain/preferences.js';
import {
  OPEN_METHOD_OPTIONS,
  DEFAULT_OPEN_METHOD,
  setSelectValue,
  renderBehaviorLoading,
  renderBehaviorError,
  showSaveSuccess,
  showSaveError,
} from '../views/behaviorView.js';

/** localStorage 中存储默认打开方式的键名。 */
const STORAGE_KEY = 'fdn-default-open-method';

/**
 * 行为设置页面 controller。
 * elements.select 对应页面中的下拉选择器。
 */
export function createBehaviorController(elements) {
  /**
   * 验证打开方式值是否合法。
   * @param {string} value - 待验证的值
   * @returns {boolean} 是否合法
   */
  function isValidMethod(value) {
    return OPEN_METHOD_OPTIONS.some((opt) => opt.value === value);
  }

  /**
   * 保存用户选择的默认打开方式到 localStorage。
   * @param {string} value - 选中的值
   */
  function savePreference(value) {
    if (!isValidMethod(value)) {
      console.warn(`尝试保存无效的打开方式: ${value}`);
      showSaveError('无效的选项，请重新选择');
      // 恢复为上次有效值
      const fallback = readPreference(STORAGE_KEY) || DEFAULT_OPEN_METHOD;
      setSelectValue(elements.select, fallback);
      return;
    }
    writePreference(STORAGE_KEY, value);
    showSaveSuccess('默认打开方式已更新');
  }

  /**
   * 加载已保存的偏好设置并恢复到下拉选择器。
   */
  async function load() {
    const selectEl = elements.select;
    if (!selectEl) return;

    try {
      const saved = readPreference(STORAGE_KEY);
      if (saved && isValidMethod(saved)) {
        setSelectValue(selectEl, saved);
      } else {
        // 未保存过或值无效，使用默认值
        setSelectValue(selectEl, DEFAULT_OPEN_METHOD);
      }
    } catch (error) {
      console.error('加载行为设置失败', error);
      renderBehaviorError(elements.container, error, load);
      return;
    }

    // 监听下拉选择器的变更事件，实时保存
    selectEl.addEventListener('change', function () {
      savePreference(selectEl.value);
    });
  }

  return { load };
}