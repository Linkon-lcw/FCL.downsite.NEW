import { normalizeDownloadItem } from './common.js';

// cxsjmc API 已经直接返回文件数组；这里只做字段归一化，不引入任何网络请求。
export function adaptCxsjmc(payload, context) {
  return (Array.isArray(payload) ? payload : []).map((item) => normalizeDownloadItem(item, context.source));
}
