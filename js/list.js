import { createListController } from './controllers/listController.js';

document.addEventListener('DOMContentLoaded', () => {
  const controller = createListController({
    tags: document.getElementById('filter-tag'),
    list: document.getElementById('list-content'),
    search: document.querySelector('.mdui-textfield-input'),
  });
  controller.load();
});
