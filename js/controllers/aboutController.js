import { getMirrors } from '../repositories/siteRepository.js';
import { getJSON } from '../http/client.js';
import {
  renderDownloadLines,
  renderContributors,
  renderUsedProjects,
  renderAboutLoading,
  renderAboutError,
} from '../views/aboutView.js';

/**
 * 关于页面 controller。
 * elements.downloadLines / contributors / usedProjects 分别对应页面中的三个挂载点。
 */
export function createAboutController(elements) {
  async function load() {
    renderAboutLoading(elements.downloadLines);
    renderAboutLoading(elements.contributors);
    renderAboutLoading(elements.usedProjects);

    try {
      const [mirrors, contributors, usedProjects] = await Promise.all([
        getMirrors(),
        getJSON('/data/contribute.json', { cache: true }),
        getJSON('/data/usedProj.json', { cache: true }),
      ]);

      renderDownloadLines(elements.downloadLines, mirrors, contributors);
      renderContributors(elements.contributors, contributors);
      renderUsedProjects(elements.usedProjects, usedProjects);
    } catch (error) {
      console.error('关于页面加载失败', error);
      renderAboutError(elements.downloadLines, error, load);
      renderAboutError(elements.contributors, error, load);
      renderAboutError(elements.usedProjects, error, load);
    }
  }

  return { load };
}