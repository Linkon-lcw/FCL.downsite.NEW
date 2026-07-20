import { createListController } from './controllers/listController.js';

// 资源列表所有筛选状态由 controller 保存，避免在 DOM dataset 中保存业务状态。
document.addEventListener('DOMContentLoaded', () => {
  const controller = createListController({
    tags: document.getElementById('filter-tag'),
    list: document.getElementById('list-content'),
    search: document.querySelector('.mdui-textfield-input'),
  });
  controller.load();
});
