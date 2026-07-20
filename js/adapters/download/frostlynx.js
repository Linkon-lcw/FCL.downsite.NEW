import { normalizeDownloadItem } from './common.js';

/** frostlynx 线路适配器，payload 为 { versions: { [version]: asset[] } }。 */
// frostlynx 协议使用 { versions: { 版本号: 文件数组 } }，键名本身就是版本节点。
export function adaptFrostlynx(payload, context) {
  return Object.entries(payload?.versions || {}).map(([version, items]) => ({
    name: version,
    default: version === context.latestVersion,
    children: (items || []).map((item) => normalizeDownloadItem(item, context.source, version)),
  }));
}
