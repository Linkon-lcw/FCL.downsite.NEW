import { createBehaviorController } from './controllers/behaviorController.js';

/**
 * 行为设置页面入口。
 * controller 从 setting.json 加载配置树并驱动 view 动态渲染。
 */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const controller = createBehaviorController({ container });
  controller.load();
});
