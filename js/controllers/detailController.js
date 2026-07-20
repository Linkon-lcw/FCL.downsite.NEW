import { getSoftware, getTags } from '../repositories/siteRepository.js';
import { renderDetail, renderDetailError, renderDetailLoading } from '../views/detailView.js';

/**
 * 详情 controller 只协调数据与 view：软件详情和标签可并行加载，
 * view 不需要知道网络层和数据校验规则。
 */
export function createDetailController(elements, softwareId) {
  async function load() {
    renderDetailLoading(elements);
    try {
      const [{ basic, detail }, tags] = await Promise.all([
        getSoftware(softwareId),
        getTags(),
      ]);
      // 在渲染前验证外键，避免把孤立的 tagId 默默展示成数字。
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
