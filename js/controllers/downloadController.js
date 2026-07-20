import { detectSystemInfo } from '../domain/systemInfo.js';
import { getMirrors, getSoftware } from '../repositories/siteRepository.js';
import { createDownloadSelectorController } from './downloadSelectorController.js';
import { renderStatus, setErrorTitle, setSoftwareHeader } from '../views/commonView.js';

function joinUrl(baseUrl, key) {
  return `${String(baseUrl).replace(/\/$/, '')}/${String(key).replace(/^\//, '')}`;
}

export function createDownloadController(elements, softwareId) {
  let selectorController = null;

  async function load() {
    selectorController?.abort();
    renderStatus(elements.container, 'loading', { message: '正在加载下载线路……' });
    try {
      const [{ basic, detail }, mirrors, system] = await Promise.all([
        getSoftware(softwareId),
        getMirrors(),
        Promise.resolve().then(detectSystemInfo),
      ]);
      setSoftwareHeader(basic, {
        titlePrefix: '下载',
        detailButton: elements.detailButton,
      });
      const mirrorMap = new Map(mirrors.map((mirror) => [mirror.id, mirror]));
      const mirrorItems = (detail.download || []).map((download) => {
        const mirror = mirrorMap.get(download.mirrorId);
        if (!mirror) throw new Error(`软件引用了不存在的镜像 ${download.mirrorId}`);
        return {
          name: mirror.name,
          sourceName: mirror.name,
          nextUrl: joinUrl(mirror.baseUrl, download.key),
          apiVersion: mirror.apiVer,
        };
      });
      if (!mirrorItems.length) throw new Error('该软件暂无下载线路');

      elements.container.replaceChildren();
      selectorController = createDownloadSelectorController({
        container: elements.container,
        stopButton: elements.stopButton,
        matchedArchitecture: system.matchedArchitecture,
        softwareName: basic.name,
        dataSource: [{ name: basic.name, nameIsSoftware: true, children: mirrorItems }],
      });
      selectorController.start();
    } catch (error) {
      console.error('下载页初始化失败', error);
      setErrorTitle();
      renderStatus(elements.container, 'error', { message: error.message, onRetry: load });
    }
  }
  return { load };
}
