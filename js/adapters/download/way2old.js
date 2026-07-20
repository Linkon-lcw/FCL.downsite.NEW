import { normalizeDownloadItem } from './common.js';

export function adaptWay2old(payload, context) {
  const visit = (items, version = '') => (Array.isArray(items) ? items : items?.children || []).flatMap((item) => {
    if (item.type === 'directory') {
      return [{
        name: item.name,
        default: item.name === context.latestVersion,
        description: item.description || '',
        children: visit(item.children, item.name),
      }];
    }
    if (item.type === 'file') return [normalizeDownloadItem(item, context.source, version)];
    return [];
  });
  return visit(payload);
}
