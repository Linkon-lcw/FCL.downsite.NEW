const VERSION_NUMBER = /\d+/g;

export function compareVersionsDescending(left, right) {
  const leftParts = String(left).match(VERSION_NUMBER)?.map(Number) || [];
  const rightParts = String(right).match(VERSION_NUMBER)?.map(Number) || [];
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (rightParts[index] || 0) - (leftParts[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

export function normalizeDownloadItem(item, source, version = '') {
  const downloadUrl = item.downloadUrl || item.url || item.link || item.download_link || '';
  return {
    name: item.name || item.file_name || item.arch || downloadUrl.split('/').pop() || '下载',
    version,
    architecture: item.architecture || item.arch || '',
    size: item.size ?? item.size_bytes ?? null,
    description: item.description || item.unavailable_reason || '',
    downloadUrl,
    available: item.available !== false,
    source,
  };
}

export function randomlySelectDefault(items) {
  const candidates = items.filter((item) => item.notJoinRandom !== true);
  if (!candidates.length) return items;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return items.map((item) => ({ ...item, default: item === chosen }));
}
