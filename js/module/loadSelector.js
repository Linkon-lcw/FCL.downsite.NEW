import SelectorRunner from './selectorRunner.js';

export default class loadSelector {
  static async loadSelector(options) {
    const runner = new SelectorRunner(options);
    await runner.start();
  }
}
