import { createAboutController } from './controllers/aboutController.js';

/**
 * 关于页面入口。
 * 加载线路对照表、贡献者列表、开源项目三个区域的数据并渲染。
 */
document.addEventListener('DOMContentLoaded', () => {
  const controller = createAboutController({
    downloadLines: document.getElementById('downloadLinesTableBody'),
    contributors: document.getElementById('contributorsPanel'),
    usedProjects: document.getElementById('usedProjectsTableBody'),
  });
  controller.load();
});