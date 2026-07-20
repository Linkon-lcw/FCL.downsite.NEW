import { getSoftware, getTags } from '../repositories/siteRepository.js';
import { renderDetail, renderDetailError, renderDetailLoading } from '../views/detailView.js';

export function createDetailController(elements, softwareId) {
  async function load() {
    renderDetailLoading(elements);
    try {
      const [{ basic, detail }, tags] = await Promise.all([
        getSoftware(softwareId),
        getTags(),
      ]);
      const knownTags = new Set(tags.map((tag) => tag.id));
      basic.tagIds.forEach((id) => {
        if (!knownTags.has(id)) throw new Error(`软件引用了不存在的标签 ${id}`);
      });
      renderDetail(elements, softwareId, basic, detail, tags);
    } catch (error) {
      console.error('详情页加载失败', error);
      renderDetailError(elements, error, load);
    }
  }
  return { load };
}
