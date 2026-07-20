/**
 * 浏览器偏好存储的小型封装。
 * 当前仅由主题使用，但不把 key 限制为主题名，后续可复用到其他非关键 UI 偏好。
 */

/** 读取主题等非关键偏好；隐私模式或存储被禁用时降级为 null，不阻断页面。 */
export function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`无法读取设置 ${key}`, error);
    return null;
  }
}

/** 写入偏好失败仅记录警告，主题仍会在当前页面生效。 */
export function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`无法保存设置 ${key}`, error);
  }
}
