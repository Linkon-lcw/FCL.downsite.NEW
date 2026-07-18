import utils from './utils.js';

/**
 * 应用主题：移除所有旧主题类，添加新主题类
 * @param {string} theme - 主题布局
 * @param {string} primary - 主色
 * @param {string} accent - 强调色
 */
export function applyTheme(theme, primary, accent) {
  if (!theme) theme = utils.readLocalStorage('fdn-theme');
  if (!primary) primary = utils.readLocalStorage('fdn-theme-primary');
  if (!accent) accent = utils.readLocalStorage('fdn-theme-accent');

  const doc = document.body;

  // 收集并移除所有 mdui-theme-* 类
  const classesToRemove = [];
  for (const cls of doc.classList) {
    if (cls.startsWith('mdui-theme-')) {
      classesToRemove.push(cls);
    }
  }
  classesToRemove.forEach(cls => doc.classList.remove(cls));

  // 应用新主题
  const themeVal = theme || 'auto';
  const primaryVal = primary || 'teal';
  const accentVal = accent || 'green';

  doc.classList.add(`mdui-theme-layout-${themeVal}`);
  doc.classList.add(`mdui-theme-primary-${primaryVal}`);
  doc.classList.add(`mdui-theme-accent-${accentVal}`);

  // 保存默认值
  if (!theme) utils.writeLocalStorage('fdn-theme', 'auto');
  if (!primary) utils.writeLocalStorage('fdn-theme-primary', 'teal');
  if (!accent) utils.writeLocalStorage('fdn-theme-accent', 'green');

  console.log(`主题：${themeVal}，主色：${primaryVal}，强调色：${accentVal}`);
}