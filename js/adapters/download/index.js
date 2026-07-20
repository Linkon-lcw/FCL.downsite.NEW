import { adaptCxsjmc } from './cxsjmc.js';
import { adaptFengyuan } from './fengyuan.js';
import { adaptFrostlynx } from './frostlynx.js';
import { adaptLemwood } from './lemwood.js';
import { adaptPlain } from './plain.js';
import { adaptWay2old } from './way2old.js';
export { randomlySelectDefault } from './common.js';

// 新增线路时：新增纯转换文件，再仅在这里登记 apiVer；不要修改选择器或渲染器。
const ADAPTERS = new Map([
  ['Way2old', adaptWay2old],
  ['frostlynx', adaptFrostlynx],
  ['Lemwood', adaptLemwood],
  ['LemwoodLatest', (payload, context) => adaptLemwood(payload, context, { latestOnly: true })],
  ['fengyuan', adaptFengyuan],
  ['cxsjmc', adaptCxsjmc],
]);

export function adaptDownloadData(payload, apiVersion, context = {}) {
  // 为所有 adapter 补齐同一份上下文，未登记协议自动退回兼容性的 plain adapter。
  const normalizedContext = {
    source: context.source || apiVersion || '未知线路',
    baseUrl: context.baseUrl || window.location.origin,
    latestVersion: context.latestVersion || payload?.latest || null,
  };
  return (ADAPTERS.get(apiVersion) || adaptPlain)(payload, normalizedContext);
}
