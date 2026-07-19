export default class data {

  /**
   * 获取标签列表
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  static async fetchTags() {
    const response = await fetch('/data/tag.json');
    return await response.json();
  }

  /**
   * 获取所有软件的基本数据
   * @returns {Promise<Array<{id: number, name: string, icon: string, tagIds: number[]}>>}
   */
  static async fetchSoftwareList() {
    const response = await fetch('/data/index.json');
    const idList = await response.json();

    const results = await Promise.all(
      idList.map(async (id) => {
        const basicResponse = await fetch(`/data/software/${id}/basic.json`);
        const basic = await basicResponse.json();
        return {
          id: id,
          name: basic.name,
          icon: basic.icon,
          tagIds: basic.tagId || []
        };
      })
    );

    return results;
  }

  /**
   * 获取单个软件的详情数据
   * @param {number} id - 软件 ID
   * @returns {Promise<{basic: {name: string, icon: string, tagId: number[]}, detail: {info: Array, intro: Array, releaseHistoryUrl: string, download: Array}}>}
   */
  static async fetchSoftwareDetail(id) {
    const [basicResponse, detailResponse] = await Promise.all([
      fetch(`/data/software/${id}/basic.json`),
      fetch(`/data/software/${id}/detail.json`)
    ]);

    const basic = await basicResponse.json();
    const detail = await detailResponse.json();

    return { basic, detail };
  }

  /**
   * 获取反馈渠道
   * @returns {Promise<Array<{name: string, href: string}>>}
   */
  static async fetchFeedbackChannels() {
    const response = await fetch('/data/feedback.json');
    return await response.json();
  }

  /**
 * 获取线路（镜像）数据
 */
  static async fetchMirrors() {
    const response = await fetch('/data/mirror.json');
    return await response.json();
  }

}