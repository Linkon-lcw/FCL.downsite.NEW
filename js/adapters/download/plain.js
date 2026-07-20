import { normalizeDownloadItem } from './common.js';

/**
 * 未登记 apiVer 的兼容入口。它保留已有 children 层级，
 * 并仅在发现下载 URL 时转换为统一下载项，方便逐步迁移旧线路。
 */
export function adaptPlain(payload, context) {
  const items = Array.isArray(payload) ? payload : payload?.items || payload?.children || [];
  return items.map((item) => {
    if (item.children) return { ...item, children: adaptPlain(item.children, context) };
    if (item.url || item.downloadUrl || item.link || item.download_link) {
      return normalizeDownloadItem(item, context.source, item.version);
    }
    return { ...item };
  });
}
