import { renderStatus } from './commonView.js';
import { createSafeContent } from '../security/content.js';

/**
 * 关于页面 view。
 * 负责渲染下载线路对照表、网站开发贡献者列表、使用的开源项目三个区域。
 */

/** 渲染加载状态。 */
export function renderAboutLoading(container) {
  renderStatus(container, 'loading', { message: '正在加载……' });
}

/** 渲染错误状态。 */
export function renderAboutError(container, error, onRetry) {
  renderStatus(container, 'error', { message: error.message, onRetry });
}

/**
 * 渲染下载线路对照表。
 * @param {HTMLElement} container tbody 容器
 * @param {Array} mirrors 线路数据，来自 mirror.json
 * @param {Array} contributors 贡献者数据，来自 contribute.json
 */
export async function renderDownloadLines(container, mirrors, contributors) {
  const contributorMap = new Map();
  contributors.forEach((c) => contributorMap.set(c.id, c));

  const fragment = document.createDocumentFragment();
  mirrors.forEach((mirror) => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.textContent = mirror.name;
    const tdProvider = document.createElement('td');

    const ids = mirror.contributeId || [];
    if (ids.length === 0) {
      tdProvider.textContent = '未知';
    } else {
      ids.forEach((id, index) => {
        if (index > 0) tdProvider.appendChild(document.createTextNode('、'));
        const c = contributorMap.get(id);
        const name = c ? (c.accentName || c.name) : `contributorID-${id}`;
        const a = document.createElement('a');
        a.href = '#' + name;
        a.textContent = name;
        tdProvider.appendChild(a);
      });
    }

    tr.append(tdName, tdProvider);
    fragment.appendChild(tr);
  });
  container.replaceChildren(await createSafeContent(fragment));
}

/**
 * 渲染网站开发贡献者列表。
 * @param {HTMLElement} container MDUI 面板容器
 * @param {Array} contributors 贡献者数据
 */
export async function renderContributors(container, contributors, mirrors) {
  const fragment = document.createDocumentFragment();

  // 构建 贡献者ID → 线路名列表 的映射
  const contributorMirrors = new Map();
  mirrors.forEach((m) => {
    (m.contributeId || []).forEach((cid) => {
      if (!contributorMirrors.has(cid)) contributorMirrors.set(cid, []);
      contributorMirrors.get(cid).push(m.name);
    });
  });

  contributors.forEach((c) => {
    const panelItem = document.createElement('div');
    panelItem.className = 'mdui-panel-item mdui-panel-item-open';

    // Header
    const header = document.createElement('div');
    header.className = 'mdui-panel-item-header mdui-ripple';
    header.id = c.accentName || c.name || `contributorID-${c.id}`;

    const headerTitle = document.createElement('div');
    headerTitle.textContent = c.accentName || c.name;

    const arrow = document.createElement('i');
    arrow.className = 'mdui-panel-item-arrow mdui-icon material-icons';
    arrow.textContent = 'keyboard_arrow_down';

    header.append(headerTitle, arrow);

    // Body
    const body = document.createElement('div');
    body.className = 'mdui-panel-item-body mdui-container-fluid';

    const row = document.createElement('div');
    row.className = 'mdui-row';

    // 左侧：头像卡片 + 链接按钮
    const leftCol = document.createElement('div');
    leftCol.className = 'mdui-col-xs-12 mdui-col-sm-4';

    const card = document.createElement('div');
    card.className = 'mdui-card';

    const media = document.createElement('div');
    media.className = 'mdui-card-media';

    const img = document.createElement('img');
    img.src = c.avatar || '/media/img/picMissing.webp';
    img.loading = 'lazy';

    const covered = document.createElement('div');
    covered.className = 'mdui-card-media-covered';

    const primary = document.createElement('div');
    primary.className = 'mdui-card-primary';

    const primaryTitle = document.createElement('div');
    primaryTitle.className = 'mdui-card-primary-title';
    primaryTitle.textContent = c.accentName || c.name;

    const primarySubtitle = document.createElement('div');
    primarySubtitle.className = 'mdui-card-primary-subtitle';
    primarySubtitle.textContent = c.name;

    primary.append(primaryTitle, primarySubtitle);
    covered.appendChild(primary);
    media.append(img, covered);
    card.appendChild(media);

    // 链接按钮
    const linkContainer = document.createElement('div');
    if (c.link && c.link.length > 0) {
      c.link.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
        a.textContent = link.name;
        linkContainer.appendChild(a);
      });
    }

    leftCol.append(card, linkContainer);

    // 右侧：贡献描述
    const rightCol = document.createElement('div');
    rightCol.className = 'mdui-typo mdui-col-xs-12 mdui-col-sm-8';

    const ul = document.createElement('ul');

    // content 字段按数组拆分为多条贡献描述
    if (c.content) {
      const lines = c.content.filter((line) => line.trim());
      lines.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line.trim();
        ul.appendChild(li);
      });
    }

    // 提及该贡献者提供的线路
    const mirrorNames = contributorMirrors.get(c.id);
    if (mirrorNames && mirrorNames.length > 0) {
      const li = document.createElement('li');
      li.textContent = '提供' + mirrorNames.join('、');
      ul.appendChild(li);
    }

    if (ul.children.length > 0) {
      rightCol.appendChild(ul);
    }

    row.append(leftCol, rightCol);
    body.appendChild(row);
    panelItem.append(header, body);
    fragment.appendChild(panelItem);
  });

  container.replaceChildren(await createSafeContent(fragment));
  window.mdui?.mutation();
}

/**
 * 渲染使用的开源项目表格。
 * @param {HTMLElement} container tbody 容器
 * @param {Array} projects 开源项目数据，来自 usedProj.json
 */
export async function renderUsedProjects(container, projects) {
  const fragment = document.createDocumentFragment();

  projects.forEach((p) => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = p.name;

    const tdDesc = document.createElement('td');
    tdDesc.textContent = p.description;

    const tdUseDesc = document.createElement('td');
    tdUseDesc.textContent = p.useDescription;

    const tdVersion = document.createElement('td');
    tdVersion.textContent = p.useVersion;

    const tdLink = document.createElement('td');
    const linkA = document.createElement('a');
    linkA.href = p.link;
    linkA.target = '_blank';
    linkA.rel = 'noopener noreferrer';
    linkA.textContent = p.link;
    tdLink.appendChild(linkA);

    const tdLicense = document.createElement('td');
    if (p.licenseLink) {
      const licenseA = document.createElement('a');
      licenseA.href = p.licenseLink;
      licenseA.target = '_blank';
      licenseA.rel = 'noopener noreferrer';
      licenseA.textContent = p.license;
      tdLicense.appendChild(licenseA);
    } else {
      tdLicense.textContent = p.license;
    }

    tr.append(tdName, tdDesc, tdUseDesc, tdVersion, tdLink, tdLicense);
    fragment.appendChild(tr);
  });

  container.replaceChildren(await createSafeContent(fragment));
}