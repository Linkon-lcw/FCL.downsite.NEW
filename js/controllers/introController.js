import { getSoftware } from '../repositories/siteRepository.js';
import { getText } from '../http/client.js';
import { createSafeContent } from '../security/content.js';
import {
  renderDocument,
  renderDocumentError,
  renderDocumentLoading,
  renderIntroError,
  renderIntroLoading,
  renderIntroPanels,
} from '../views/introView.js';

function documentUrl(item) {
  return `${String(item.url || '').replace(/\/$/, '')}/${String(item.file || '').replace(/^\//, '')}`;
}

export function createIntroController(container, softwareId) {
  const states = new WeakMap();

  async function loadDocument(item, body) {
    const state = states.get(body);
    if (state === 'loading' || state === 'ready') return;
    states.set(body, 'loading');
    renderDocumentLoading(body);
    try {
      const url = documentUrl(item);
      const rawContent = await getText(url, { timeoutMs: 20000 });
      const fragment = await createSafeContent(rawContent, {
        type: item.type === 'md' ? 'md' : 'html',
        baseUrl: url,
      });
      renderDocument(body, fragment);
      states.set(body, 'ready');
    } catch (error) {
      console.error('介绍文档加载失败', error);
      states.set(body, 'error');
      renderDocumentError(body, error, () => loadDocument(item, body));
    }
  }

  async function load() {
    renderIntroLoading(container);
    try {
      const { basic, detail } = await getSoftware(softwareId);
      renderIntroPanels(container, basic, detail.intro || [], loadDocument);
    } catch (error) {
      console.error('介绍页加载失败', error);
      renderIntroError(container, error, load);
    }
  }
  return { load };
}
