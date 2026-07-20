import { getJSON } from '../http/client.js';

function assertArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label}数据格式不正确：应为数组`);
  return value;
}

function assertUniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (!Number.isInteger(item?.id)) throw new Error(`${label}存在无效 ID`);
    if (ids.has(item.id)) throw new Error(`${label}存在重复 ID：${item.id}`);
    ids.add(item.id);
  }
  return items;
}

export async function getSoftwareCatalog(options = {}) {
  const items = assertUniqueIds(
    assertArray(await getJSON('/data/software.json', { ...options, cache: true }), '软件目录'),
    '软件目录',
  );
  items.forEach((item) => {
    if (!item.name || !item.icon || !item.detailUrl || !Array.isArray(item.tagIds)) {
      throw new Error(`软件 ${item.id} 的基础信息不完整`);
    }
  });
  return items;
}

export async function getTags(options = {}) {
  return assertUniqueIds(
    assertArray(await getJSON('/data/tag.json', { ...options, cache: true }), '标签'),
    '标签',
  );
}

export async function getMirrors(options = {}) {
  return assertUniqueIds(
    assertArray(await getJSON('/data/mirror.json', { ...options, cache: true }), '镜像线路'),
    '镜像线路',
  );
}

export async function getFeedbackChannels(options = {}) {
  return assertArray(await getJSON('/data/feedback.json', { ...options, cache: true }), '反馈渠道');
}

export async function getSoftware(id, options = {}) {
  const catalog = await getSoftwareCatalog(options);
  const basic = catalog.find((item) => item.id === id);
  if (!basic) throw new Error(`找不到 ID 为 ${id} 的软件`);
  const detail = await getJSON(basic.detailUrl, { ...options, cache: true });
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) {
    throw new Error(`软件 ${id} 的详情数据格式不正确`);
  }
  return { basic, detail };
}
