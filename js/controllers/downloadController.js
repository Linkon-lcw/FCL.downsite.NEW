import { detectSystemInfo } from '../domain/systemInfo.js';
import { getMirrors, getSoftware } from '../repositories/siteRepository.js';
import { createDownloadSelectorController } from './downloadSelectorController.js';
import { renderStatus, setErrorTitle, setSoftwareHeader } from '../views/commonView.js';

function joinUrl(baseUrl, key) {
  // 镜像配置的 baseUrl 与资源 key 可能各自带 /，统一处理避免出现双斜杠或路径被 URL 构造器截断。
  return `${String(baseUrl).replace(/\/$/, '')}/${String(key).replace(/^\//, '')}`;
}

export function createDownloadController(elements, softwareId) {
  let selectorController = null;

  async function load() {
    // 点击重试前先终止旧选择器，避免旧请求在新页面状态完成后回写 DOM。
    selectorController?.abort();
    renderStatus(elements.container, 'loading', { message: '正在加载下载线路……' });
    try {
      // 本站静态元数据与 UA 识别互不依赖，应并行完成以缩短下载页首屏时间。
      const [{ basic, detail }, mirrors, system] = await Promise.all([
        getSoftware(softwareId),
        getMirrors(),
        Promise.resolve().then(detectSystemInfo),
      ]);
      setSoftwareHeader(basic, {
        titlePrefix: '下载',
        detailButton: elements.detailButton,
      });
      // 通过 ID 建索引，既减少查找复杂度，也能明确检测 detail.json 中的错误 mirrorId。
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
      // 根层只有“当前软件”一个自动选项，下一层才是用户可切换的镜像线路。
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
