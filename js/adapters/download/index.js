import { adaptCxsjmc } from './cxsjmc.js';
import { adaptFengyuan } from './fengyuan.js';
import { adaptFrostlynx } from './frostlynx.js';
import { adaptLemwood } from './lemwood.js';
import { adaptPlain } from './plain.js';
import { adaptWay2old } from './way2old.js';
export { randomlySelectDefault } from './common.js';

const ADAPTERS = new Map([
  ['Way2old', adaptWay2old],
  ['frostlynx', adaptFrostlynx],
  ['Lemwood', adaptLemwood],
  ['LemwoodLatest', (payload, context) => adaptLemwood(payload, context, { latestOnly: true })],
  ['fengyuan', adaptFengyuan],
  ['cxsjmc', adaptCxsjmc],
]);

export function adaptDownloadData(payload, apiVersion, context = {}) {
  const normalizedContext = {
    source: context.source || apiVersion || '未知线路',
    baseUrl: context.baseUrl || window.location.origin,
    latestVersion: context.latestVersion || payload?.latest || null,
  };
  return (ADAPTERS.get(apiVersion) || adaptPlain)(payload, normalizedContext);
}
