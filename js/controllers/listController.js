import { getSoftwareCatalog, getTags } from '../repositories/siteRepository.js';
import { renderFilterTags, renderListError, renderListLoading, renderSoftwareList } from '../views/listView.js';

export function createListController(elements) {
  let catalog = [];
  let tagMap = new Map();
  let activeTagIds = new Set();
  let searchText = '';

  function applyFilters() {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    const visible = catalog.filter((item) => {
      const matchesTags = !activeTagIds.size
        || item.tagIds.some((id) => activeTagIds.has(String(id)));
      const matchesSearch = !normalizedSearch
        || item.name.toLocaleLowerCase().includes(normalizedSearch)
        || String(item.id).includes(normalizedSearch);
      return matchesTags && matchesSearch;
    });
    renderSoftwareList(elements.list, visible, tagMap);
  }

  async function load() {
    renderListLoading(elements);
    try {
      const [software, tags] = await Promise.all([getSoftwareCatalog(), getTags()]);
      const knownTags = new Set(tags.map((tag) => tag.id));
      software.forEach((item) => item.tagIds.forEach((id) => {
        if (!knownTags.has(id)) throw new Error(`软件 ${item.id} 引用了不存在的标签 ${id}`);
      }));
      catalog = software;
      tagMap = new Map(tags.map((tag) => [tag.id, tag.name]));
      renderFilterTags(elements.tags, tags, (ids) => {
        activeTagIds = ids;
        applyFilters();
      });
      applyFilters();
    } catch (error) {
      console.error('资源列表加载失败', error);
      renderListError(elements, error, load);
    }
  }

  elements.search.addEventListener('input', () => {
    searchText = elements.search.value;
    applyFilters();
  });
  return { load };
}
