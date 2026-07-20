import { normalizeDownloadItem } from './common.js';

export function adaptLemwood(payload, context, { latestOnly = false } = {}) {
  let releases = payload?.data ?? payload;
  if (!Array.isArray(releases)) releases = releases ? [releases] : [];
  if (latestOnly) releases = releases.slice(0, 1);
  return releases.map((release, index) => ({
    name: release.name || release.tag_name || `版本 ${index + 1}`,
    default: index === 0,
    children: (release.assets || []).map((asset) => normalizeDownloadItem(asset, context.source, release.name)),
  }));
}
