import { normalizeDownloadItem } from './common.js';

export function adaptCxsjmc(payload, context) {
  return (Array.isArray(payload) ? payload : []).map((item) => normalizeDownloadItem(item, context.source));
}
