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

  /**
   * 格式化字节大小为可读字符串
   * @param {number} bytes - 字节数
   * @returns {string} - 格式化后的字符串
   */
  static formatBytes(bytes) {
    if (bytes === null || bytes === undefined) return '';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 将多个Uint8Array合并为一个
   */
  static concatChunks(chunks) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
 * 从 URL 参数中获取软件 ID
 * @returns {number|null} - 软件 ID 或 null
 */
  static getSoftwareId() {
    const params = new URLSearchParams(window.location.search);
    const idStr = params.get('id');
    if (!idStr) return null;
    const id = parseInt(idStr, 10);
    return isNaN(id) ? null : id;
  }

}