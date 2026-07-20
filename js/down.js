import { createDownloadController } from './controllers/downloadController.js';
import { getSoftwareId, renderStatus, setErrorTitle } from './views/commonView.js';

// 下载页入口不直接访问镜像 API；它只把页面元素交给专用 controller。
document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    container: document.getElementById('selectors'),
    stopButton: document.getElementById('forceStopLoadBtn'),
    detailButton: document.getElementById('detailBtn'),
  };
  const softwareId = getSoftwareId();
  // 无效 ID 时保留页面框架并显示可读错误，而非让模块初始化异常中断。
  if (softwareId === null) {
    setErrorTitle();
    renderStatus(elements.container, 'error', { message: '未指定有效的软件 ID' });
    return;
  }
  createDownloadController(elements, softwareId).load();
});
