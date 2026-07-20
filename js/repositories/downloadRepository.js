import { getJSON, getText } from '../http/client.js';
import { adaptDownloadData, randomlySelectDefault } from '../adapters/download/index.js';

const GITHUB_REPOSITORIES = {
  'Fold Craft Launcher': 'FCL-Team/FoldCraftLauncher',
  'Zalith Launcher 2': 'ZalithLauncher/ZalithLauncher2',
};

async function getLatestVersion(apiVersion, softwareName, payload, signal) {
  if (apiVersion !== 'Way2old' && apiVersion !== 'frostlynx') return payload?.latest || null;
  const repository = GITHUB_REPOSITORIES[softwareName];
  if (!repository) return payload?.latest || null;
  try {
    const release = await getJSON(`https://api.github.com/repos/${repository}/releases/latest`, {
      signal,
      timeoutMs: 12000,
    });
    return release.tag_name || payload?.latest || null;
  } catch (error) {
    if (error.kind === 'abort') throw error;
    console.warn('获取最新版本失败，使用镜像返回的版本。', error);
    return payload?.latest || null;
  }
}

export async function loadDownloadNodes({
  url,
  apiVersion,
  softwareName,
  sourceName,
  random = false,
  signal,
}) {
  if (!url) {
    if (apiVersion === 'cxsjmc') {
      const release = await getJSON('https://api.github.com/repos/FCL-Team/FoldCraftLauncher/releases/latest', { signal });
      const payload = (release.assets || []).map((asset) => ({
        name: asset.name,
        url: `https://fcl.cxsjmc.cn/FCL/${asset.name}`,
      }));
      return adaptDownloadData(payload, apiVersion, { source: sourceName });
    }
    return [];
  }

  const payload = await getJSON(url, { signal, timeoutMs: 20000 });
  const latestVersion = await getLatestVersion(apiVersion, softwareName, payload, signal);
  const nodes = adaptDownloadData(payload, apiVersion, {
    source: sourceName,
    baseUrl: new URL(url, window.location.href).origin,
    latestVersion,
  });
  return random ? randomlySelectDefault(nodes) : nodes;
}

export function loadDescription(url, signal) {
  return getText(url, { signal, timeoutMs: 15000 });
}
