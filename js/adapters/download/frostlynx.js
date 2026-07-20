import { normalizeDownloadItem } from './common.js';

export function adaptFrostlynx(payload, context) {
  return Object.entries(payload?.versions || {}).map(([version, items]) => ({
    name: version,
    default: version === context.latestVersion,
    children: (items || []).map((item) => normalizeDownloadItem(item, context.source, version)),
  }));
}
