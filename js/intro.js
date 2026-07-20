import { createIntroController } from './controllers/introController.js';
import { getSoftwareId, renderStatus, setErrorTitle } from './views/commonView.js';

// 介绍页的正文懒加载逻辑位于 introController；入口仅负责一次性装配。
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('intro-content');
  const softwareId = getSoftwareId();
  if (softwareId === null) {
    setErrorTitle();
    renderStatus(container, 'error', { message: '未指定有效的软件 ID' });
    return;
  }
  createIntroController(container, softwareId).load();
});
