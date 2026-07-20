import { createDownloadController } from './controllers/downloadController.js';
import { getSoftwareId, renderStatus, setErrorTitle } from './views/commonView.js';

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    container: document.getElementById('selectors'),
    stopButton: document.getElementById('forceStopLoadBtn'),
    detailButton: document.getElementById('detailBtn'),
  };
  const softwareId = getSoftwareId();
  if (softwareId === null) {
    setErrorTitle();
    renderStatus(elements.container, 'error', { message: '未指定有效的软件 ID' });
    return;
  }
  createDownloadController(elements, softwareId).load();
});
