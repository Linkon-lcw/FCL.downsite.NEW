// 不假设版本一定遵循严格 SemVer；提取连续数字可覆盖常见的 v1.2.3、2024.01 等命名。
const VERSION_NUMBER = /\d+/g;

/** 按版本从新到旧排序，供按版本分组的镜像选择默认项。 */
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
  // 各镜像字段名不同，只有这里允许读取其原始字段；后续 controller/view 只认识统一模型。
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
  // 不修改原数组项，避免同一份镜像响应被下一次选择复用时保留过期 default 状态。
  const candidates = items.filter((item) => item.notJoinRandom !== true);
  if (!candidates.length) return items;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return items.map((item) => ({ ...item, default: item === chosen }));
}
