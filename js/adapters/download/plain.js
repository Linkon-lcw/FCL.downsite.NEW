import { normalizeDownloadItem } from './common.js';

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
