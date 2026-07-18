export default class utils {

  /**
   * 读取本地存储
   * @param {string} key - 本地存储的键
   * @returns {string|null} - 对应的值
   */
  static readLocalStorage(key) {
    const value = localStorage.getItem(key);
    console.log(`工具：读取本地存储：键：${key}：值：${value}`);
    return value;
  }

  /**
   * 写入本地存储
   * @param {string} key - 本地存储的键
   * @param {string} value - 对应的值
   */
  static writeLocalStorage(key, value) {
    console.log(`工具：写入本地存储：键：${key}：值：${value}`);
    localStorage.setItem(key, value);
  }

}