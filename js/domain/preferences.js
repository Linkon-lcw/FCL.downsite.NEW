export function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`无法读取设置 ${key}`, error);
    return null;
  }
}

export function writePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`无法保存设置 ${key}`, error);
  }
}
