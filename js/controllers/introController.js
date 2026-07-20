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
  // 数据文件习惯将 url 与 file 分开保存；手工拼接可保留 url 中可能存在的路径前缀。
  return `${String(item.url || '').replace(/\/$/, '')}/${String(item.file || '').replace(/^\//, '')}`;
}

export function createIntroController(container, softwareId) {
  // body 元素作为 WeakMap 键，页面销毁后状态可随 DOM 一起被回收。
  const states = new WeakMap();

  async function loadDocument(item, body) {
    const state = states.get(body);
    // 首次展开才加载；已经成功的正文不重复请求，正在加载时也不重复发起。
    if (state === 'loading' || state === 'ready') return;
    states.set(body, 'loading');
    renderDocumentLoading(body);
    try {
      const url = documentUrl(item);
      // 此请求发生在用户展开面板后，因此首屏不会下载 README/截图等非必要内容。
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
    // 首屏只取软件元数据与文档目录；实际正文留给 loadDocument 懒加载。
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
