import { createBehaviorController } from './controllers/behaviorController.js';

/**
 * 行为设置页面入口。
 * 加载已保存的默认打开方式偏好并绑定下拉选择器变更事件。
 */
document.addEventListener('DOMContentLoaded', () => {
  const selectEl = document.getElementById('defaultOpenMethod');
  if (!selectEl) return;

  const controller = createBehaviorController({
    select: selectEl,
    container: selectEl.closest('.mdui-panel-item-body'),
  });
  controller.load();
});