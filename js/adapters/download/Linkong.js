import { normalizeDownloadItem } from './common.js';

/**
 * Linkong API 适配器。
 * 该 API 返回 { releases: [{ version, assets: [{ name, size, download_url }] }] } 格式。
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
          downloadUrl: wdfDownUrl(context.baseUrl, release.version, asset.name, payload.owner, payload.repo),
        },
        context.source,
        release.version,
      ),
    ),
  }));
}

/**
 * 拼凑最终下载URL，API中提供的是GH原始下载URL。
 * GET /api/releases/:tag/:assetName?owner=<owner>&repo=<repo>
 * @param {string} baseUrl 基础URL
 * @param {string} tag 版本标签
 * @param {string} assetName 名称
 * @param {string} owner GH仓库所有者
 * @param {string} repo GH仓库名称
 * @returns {string} 最终下载URL
 */
export function wdfDownUrl(baseUrl, tag, assetName, owner, repo) {
  // 对路径段与查询参数编码，避免 assetName 等字段含特殊字符时破坏 URL。
  const encodedTag = encodeURIComponent(tag);
  const encodedAssetName = encodeURIComponent(assetName);
  const params = new URLSearchParams({ owner, repo });
  return `${baseUrl}/api/releases/${encodedTag}/${encodedAssetName}?${params.toString()}`;
}
