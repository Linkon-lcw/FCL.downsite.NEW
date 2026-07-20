import { createDetailController } from './controllers/detailController.js';
import { getSoftwareId } from './views/commonView.js';
import { renderDetailError } from './views/detailView.js';

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    body: document.getElementById('basic-info-body'),
    operations: document.getElementById('operationTable'),
    download: document.getElementById('btn-download'),
    intro: document.getElementById('btn-intro'),
    history: document.getElementById('btn-history'),
  };
  const softwareId = getSoftwareId();
  if (softwareId === null) {
    renderDetailError(elements, new Error('未指定有效的软件 ID'));
    return;
  }
  createDetailController(elements, softwareId).load();
});
