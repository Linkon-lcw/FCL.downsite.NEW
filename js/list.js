import data from './module/data.js';

document.addEventListener('DOMContentLoaded', async function () {
  const softwareData = await data.fetchSoftwareList();
  const tags = await data.fetchTags();

  renderFilterTags(tags);
  renderList(softwareData, tags);

  bindFilterEvents(softwareData, tags);
});

/**
 * 渲染筛选标签按钮
 * @param {Array<{id: number, name: string}>} tags
 */
function renderFilterTags(tags) {
  const container = document.getElementById('filter-tag');
  container.innerHTML = '';

  // "显示所有" 按钮
  const allBtn = document.createElement('a');
  allBtn.className = 'mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent mdui-m-a-1';
  allBtn.textContent = '显示所有';
  allBtn.dataset.tagId = '';
  container.appendChild(allBtn);

  tags.forEach((tag) => {
    const btn = document.createElement('a');
    btn.className = 'mdui-btn mdui-btn-raised mdui-ripple mdui-m-a-1';
    btn.textContent = tag.name;
    btn.dataset.tagId = tag.id;
    container.appendChild(btn);
  });
}

/**
 * 渲染软件列表
 * @param {Array<{id: number, name: string, icon: string, tagIds: number[]}>} softwareData
 */
function renderList(softwareData, tags) {
  const container = document.getElementById('list-content');
  container.innerHTML = '';

  const tagMap = {};
  tags.forEach((t) => { tagMap[t.id] = t.name; });

  softwareData.forEach((item) => {
    const tagNames = item.tagIds.map((id) => tagMap[id] || id);
    const listItem = document.createElement('div');
    listItem.className = 'xf-list-item';
    listItem.dataset.id = item.id;
    listItem.dataset.tagIds = item.tagIds.join(',');
    listItem.dataset.name = item.name;

    listItem.innerHTML = `
      <a href="/html/detail.html?id=${item.id}">
        <div class="mdui-card mdui-ripple">
          <img src="${item.icon}" alt="${item.name}">
          <span class="mdui-card-primary-title">${item.name}</span>
          <span class="mdui-card-primary-subtitle">ID: ${item.id}</span>
          <span class="mdui-card-primary-subtitle tag-subtitle">TAG: ${tagNames.join(', ')}</span>
        </div>
      </a>
    `;

    container.appendChild(listItem);
  });
}

/**
 * 绑定筛选事件
 * @param {Array} softwareData
 * @param {Array<{id: number, name: string}>} tags
 */
function bindFilterEvents(softwareData, tags) {
  const activeTagIds = new Set();

  const filterContainer = document.getElementById('filter-tag');
  const searchInput = document.querySelector('#filter-tag').parentElement.querySelector('.mdui-textfield-input');
  const allBtn = filterContainer.querySelector('a[data-tag-id=""]');

  // 标签按钮点击事件
  filterContainer.addEventListener('click', function (e) {
    const btn = e.target.closest('a');
    if (!btn) return;

    const tagId = btn.dataset.tagId;

    if (tagId === '') {
      // "显示所有"：清空所有选中
      activeTagIds.clear();
      filterContainer.querySelectorAll('a').forEach((b) => {
        b.classList.remove('mdui-color-theme-accent');
      });
      allBtn.classList.add('mdui-color-theme-accent');
    } else {
      // 切换标签选中状态
      if (activeTagIds.has(tagId)) {
        activeTagIds.delete(tagId);
        btn.classList.remove('mdui-color-theme-accent');
      } else {
        activeTagIds.add(tagId);
        btn.classList.add('mdui-color-theme-accent');
      }

      // 若无选中标签，高亮"显示所有"
      if (activeTagIds.size === 0) {
        allBtn.classList.add('mdui-color-theme-accent');
      } else {
        allBtn.classList.remove('mdui-color-theme-accent');
      }
    }

    applyFilter(softwareData, tags, activeTagIds, searchInput.value);
  });

  // 搜索输入事件
  searchInput.addEventListener('input', function () {
    applyFilter(softwareData, tags, activeTagIds, searchInput.value);
  });
}

/**
 * 应用筛选条件
 * @param {Array} softwareData
 * @param {Array<{id: number, name: string}>} tags
 * @param {Set<string>} activeTagIds - 当前选中的标签ID集合（空表示显示所有）
 * @param {string} searchText - 搜索文本
 */
function applyFilter(softwareData, tags, activeTagIds, searchText) {
  const items = document.querySelectorAll('#list-content .xf-list-item');

  items.forEach((item) => {
    let visible = true;

    // 标签筛选：匹配任一选中标签
    if (activeTagIds.size > 0) {
      const tagIds = item.dataset.tagIds.split(',').filter(Boolean);
      if (!tagIds.some((id) => activeTagIds.has(id))) {
        visible = false;
      }
    }

    // 搜索筛选
    if (searchText && searchText.trim()) {
      const name = item.dataset.name.toLowerCase();
      const id = item.dataset.id;
      const searchLower = searchText.toLowerCase().trim();
      if (!name.includes(searchLower) && !id.includes(searchLower)) {
        visible = false;
      }
    }

    item.style.display = visible ? '' : 'none';
  });
}

