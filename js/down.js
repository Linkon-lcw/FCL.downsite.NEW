import data from './module/data.js';
import utils from './module/utils.js';
import loadSelector from './module/loadSelector.js';
import loadContent from './module/loadContent.js';

document.addEventListener('DOMContentLoaded', async () => {
  const id = utils.getSoftwareId();
  if (id === null) {
    showError('未指定软件 ID');
    return;
  }

  try {
    const [{ basic, detail }, mirrors] = await Promise.all([
      data.fetchSoftwareDetail(id),
      data.fetchMirrors()
    ]);

    renderPage(id, basic, detail, mirrors);
  } catch (err) {
    showError(err);
  }
});

/**
 * 渲染页面
 * @param {number} id - 软件 ID
 * @param {Object} basic - 基本软件信息
 * @param {Object} detail - 详细软件信息
 * @param {Array} mirrors - 线路（镜像）数据
 */
function renderPage(id, basic, detail, mirrors) {
  const iconEl = document.getElementById('icon');
  const titleEl = document.getElementById('title');
  const detailBtn = document.getElementById('detailBtn');

  if (detailBtn) {
    detailBtn.href = `detail.html?id=${id}`;
  }

  // 设置软件图标
  if (iconEl) {
    iconEl.src = basic.icon;
    iconEl.alt = basic.name;
  }

  // 设置标题
  if (titleEl) {
    titleEl.textContent = `下载${basic.name}`;
  }
  document.title = `下载${basic.name}`;

  // 构建级联选择器数据
  const cascadeData = buildCascadeData(basic, detail.download, mirrors);

  // 初始化级联选择器
  loadSelector.loadSelector({
    containerId: 'selectors',
    dataSource: cascadeData,
    forceStopLoadBtnId: 'forceStopLoadBtn',
  });

  // 绑定强行终止加载按钮
  const forceStopBtn = document.getElementById('forceStopLoadBtn');
  if (forceStopBtn) {
    forceStopBtn.addEventListener('click', () => {
      loadContent.xf_abortAllLoadings();
    });
  }
}

/**
 * 将线路数据包装为级联选择器格式
 * 第一层：软件名称（用于记录 selectName，供 API 转换使用）
 * 第二层：线路列表（每个线路的 nextUrl = baseUrl + key）
 * @param {Object} basic - 基本软件信息
 * @param {Array} downloads - 下载信息数组
 * @param {Array} mirrors - 线路（镜像）数据
 * @returns {Array} - 级联选择器数据
 */
function buildCascadeData(basic, downloads, mirrors) {
  const mirrorMap = Object.fromEntries(mirrors.map(m => [m.id, m]));

  const mirrorItems = downloads
    .map(dl => {
      const mirror = mirrorMap[dl.mirrorId];
      if (!mirror) return null;

      return {
        name: mirror.name,
        nextUrl: mirror.baseUrl + dl.key,
        apiVer: mirror.apiVer,
      };
    })
    .filter(Boolean);

  return [{
    name: basic.name,
    nameIsSoftname: true,
    children: mirrorItems,
  }];
}

/**
 * 显示错误信息
 */
function showError(message) {
  const msg = message instanceof Error ? message.message : String(message);
  console.error('下载：错误：', msg);

  const titleEl = document.getElementById('title');
  if (titleEl) {
    titleEl.textContent = '错误';
  }
  document.title = '错误';

  const selectorsEl = document.getElementById('selectors');
  if (selectorsEl) {
    selectorsEl.innerHTML = `<div class="mdui-typo" style="color: #f00"><p>${msg}</p></div>`;
  }
}