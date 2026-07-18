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

}