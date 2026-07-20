import { compareVersionsDescending, normalizeDownloadItem } from './common.js';

export function adaptFengyuan(payload, context) {
  const grouped = new Map();
  for (const asset of payload?.data?.assets || []) {
    const version = asset.version || '未知版本';
    if (!grouped.has(version)) grouped.set(version, []);
    grouped.get(version).push(normalizeDownloadItem({
      ...asset,
      architecture: asset.architecture === 'None' && asset.file_name?.includes('Zalith')
        ? 'all'
        : asset.architecture,
      downloadUrl: new URL(asset.download_path, context.baseUrl).href,
    }, context.source, version));
  }
  const versions = [...grouped.keys()].sort(compareVersionsDescending);
  return versions.map((version, index) => ({
    name: version,
    default: index === 0,
    children: grouped.get(version),
  }));
}
