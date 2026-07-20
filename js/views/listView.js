import { renderStatus } from './commonView.js';

export function renderListLoading(elements) {
  renderStatus(elements.list, 'loading', { message: '正在加载软件目录……' });
  renderStatus(elements.tags, 'loading', { message: '正在加载标签……' });
}

export function renderListError(elements, error, onRetry) {
  renderStatus(elements.list, 'error', { message: error.message, onRetry });
  elements.tags.replaceChildren();
}

export function renderFilterTags(container, tags, onChange) {
  const activeTagIds = new Set();
  const fragment = document.createDocumentFragment();
  const allButton = createTagButton('显示所有', '', true);
  fragment.appendChild(allButton);
  tags.forEach((tag) => fragment.appendChild(createTagButton(tag.name, String(tag.id))));
  container.replaceChildren(fragment);

  container.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tag-id]');
    if (!button) return;
    const tagId = button.dataset.tagId;
    if (!tagId) activeTagIds.clear();
    else if (activeTagIds.has(tagId)) activeTagIds.delete(tagId);
    else activeTagIds.add(tagId);

    container.querySelectorAll('button[data-tag-id]').forEach((candidate) => {
      const id = candidate.dataset.tagId;
      candidate.classList.toggle('mdui-color-theme-accent', id ? activeTagIds.has(id) : activeTagIds.size === 0);
      candidate.setAttribute('aria-pressed', id ? String(activeTagIds.has(id)) : String(activeTagIds.size === 0));
    });
    onChange(new Set(activeTagIds));
  });
}

function createTagButton(label, tagId, selected = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mdui-btn mdui-btn-raised mdui-ripple mdui-m-a-1';
  button.classList.toggle('mdui-color-theme-accent', selected);
  button.textContent = label;
  button.dataset.tagId = tagId;
  button.setAttribute('aria-pressed', String(selected));
  return button;
}

export function renderSoftwareList(container, software, tagMap) {
  if (!software.length) {
    renderStatus(container, 'empty', { message: '没有符合条件的软件' });
    return;
  }
  const fragment = document.createDocumentFragment();
  software.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'xf-list-item';

    const link = document.createElement('a');
    link.href = `/html/detail.html?id=${item.id}`;
    const card = document.createElement('div');
    card.className = 'mdui-card mdui-ripple';
    const image = document.createElement('img');
    image.src = item.icon;
    image.alt = item.name;
    image.width = 96;
    image.height = 96;
    image.loading = 'lazy';
    image.decoding = 'async';
    card.append(image, createText('mdui-card-primary-title', item.name));
    card.append(createText('mdui-card-primary-subtitle', `ID: ${item.id}`));
    const tagNames = item.tagIds.map((id) => tagMap.get(id) || String(id));
    card.append(createText('mdui-card-primary-subtitle tag-subtitle', `TAG: ${tagNames.join(', ')}`));
    link.appendChild(card);
    wrapper.appendChild(link);
    fragment.appendChild(wrapper);
  });
  container.replaceChildren(fragment);
}

function createText(className, value) {
  const element = document.createElement('span');
  element.className = className;
  element.textContent = value;
  return element;
}
