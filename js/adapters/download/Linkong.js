import { normalizeDownloadItem } from './common.js';

/**
 * Linkong API 适配器。
 * API 换新的了，返回的 download_url 直接就是镜像地址，旧的呢？KV缓存线被剪了
 * 响应格式：{ releases: [{ version, title, assets: [{ name, size, download_url }] }] }
 * @param {object} payload Linkong API 响应
 * @param {{source: string}} context 线路显示名
 */
export function adaptLinkong(payload, context) {
  const releases = payload?.releases || [];
  return releases.map((release, index) => ({
    name: release.version || release.title || `版本 ${index + 1}`,
    default: index === 0,
    children: (release.assets || []).map((asset) =>
      normalizeDownloadItem(
        {
          ...asset,
          downloadUrl: asset.download_url,
        },
        context.source,
        release.version,
      ),
    ),
  }));
}
