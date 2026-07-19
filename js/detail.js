import data from './module/data.js';

document.addEventListener('DOMContentLoaded', async () => {
  const ele = {
    titleIcon: document.getElementById('icon'),
    title: document.getElementById('title'),
    basicInfoBody: document.getElementById('basic-info-body'),
    operationTable: document.getElementById('operationTable'),
    btnDownload: document.getElementById('btn-download'),
    btnIntro: document.getElementById('btn-intro'),
    btnHistory: document.getElementById('btn-history'),
  };

  const id = getSoftwareId();
  if (id === null) {
    await showError('未指定软件 ID', ele);
    return;
  }

  try {
    const [{ basic, detail }, tags] = await Promise.all([
      data.fetchSoftwareDetail(id),
      data.fetchTags()
    ]);
    renderPage(id, ele, basic, detail, tags);
  } catch (err) {
    await showError(err, ele);
  }
});

/**
 * 从 URL 参数中获取软件 ID
 * @returns {number|null}
 */
function getSoftwareId() {
  const params = new URLSearchParams(window.location.search);
  const idStr = params.get('id');
  if (!idStr) return null;
  const id = parseInt(idStr, 10);
  return isNaN(id) ? null : id;
}

/**
 * 渲染整个页面
 * @param {number} id
 * @param {{titleIcon, title, basicInfoBody, btnDownload, btnIntro, btnHistory}} ele
 * @param {{name: string, icon: string, tagId: number[]}} basic
 * @param {{info: Array<{name: string, href?: string, text?: string}>, releaseHistoryUrl: string}} detail
 * @param {Array<{id: number, name: string}>} tags
 */
function renderPage(id, ele, basic, detail, tags) {
  document.title = basic.name;
  if (ele.titleIcon) {
    ele.titleIcon.src = basic.icon;
    ele.titleIcon.alt = basic.name;
  }
  if (ele.title) ele.title.textContent = basic.name;

  renderBasicInfo(id, ele.basicInfoBody, basic, detail, tags);
  updateActionButtons(id, detail, ele);
}

/**
 * 渲染基本信息表格
 * @param {number} id
 * @param {HTMLElement} tbody
 * @param {{name: string, icon: string, tagId: number[]}} basic
 * @param {{info: Array<{name: string, href?: string, text?: string}>}} detail
 * @param {Array<{id: number, name: string}>} tags
 */
function renderBasicInfo(id, tbody, basic, detail, tags) {
  if (!tbody) return;

  const tagMap = Object.fromEntries(tags.map(t => [t.id, t.name]));
  const tagNames = (basic.tagId ?? []).map(tid => tagMap[tid] ?? String(tid));

  const rows = [
    ['名称', basic.name],
    ['图标', `<img src="${basic.icon}" alt="${basic.name}" class="xf-detail-icon">`],
    ['ID', String(id)],
    ['TAG', tagNames.join(', ')],
  ];

  if (detail.info?.length) {
    detail.info.forEach(item => {
      const value = item.href
        ? `<a href="${item.href}" target="_blank">${item.href}</a>`
        : (item.text ?? '');
      rows.push([item.name, value]);
    });
  }

  tbody.innerHTML = rows.map(([name, value]) =>
    `<tr><td>${name}</td><td>${value}</td></tr>`
  ).join('');
}

/**
 * 更新操作按钮链接
 * @param {number} id
 * @param {{releaseHistoryUrl: string}} detail
 * @param {{btnDownload, btnIntro, btnHistory}} ele
 */
function updateActionButtons(id, detail, ele) {
  if (ele.btnDownload) ele.btnDownload.href = `/html/detail/down.html?id=${id}`;
  if (ele.btnIntro) ele.btnIntro.href = `/html/detail/intro.html?id=${id}`;
  if (ele.btnHistory) ele.btnHistory.href = `/html/detail/rh.html?id=${id}`;
}

/**
 * 显示错误信息
 * @param {string|Error} message
 * @param {{title, basicInfoBody, operationTable}} ele
 */
async function showError(message, ele) {
  const msg = message instanceof Error ? message.message : String(message);
  console.error(`详情：错误：${msg}`);

  if (ele.title) {
    ele.title.textContent = '错误';
    document.title = '错误';
  }

  if (ele.basicInfoBody) {
    ele.basicInfoBody.innerHTML = `<tr><td>错误</td><td>${msg}</td></tr>`;
  }

  if (ele.operationTable) {
    ele.operationTable.innerHTML = '';
    try {
      const feedbackChannels = await data.fetchFeedbackChannels();
      const feedbackUrl = feedbackChannels?.[0]?.href;
      if (feedbackUrl) {
        ele.operationTable.innerHTML = `<a class="mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple" href="${feedbackUrl}" target="_blank"><i class="mdui-icon material-icons">feedback</i> 提交反馈</a>`;
      }
    } catch (e) {
      console.error('详情：错误：获取反馈渠道：错误：', e);
    }
  }
}