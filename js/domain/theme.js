import { readPreference, writePreference } from './preferences.js';

/**
 * MDUI 主题领域逻辑。
 * theme/primary/accent 是 MDUI 类名中使用的值，不在这里校验枚举，
 * 因为主题设置页的 radio 已限定可选值，旧 localStorage 值也应保持向后兼容。
 */
export function applyTheme(theme, primary, accent) {
  // 显式参数用于主题设置页即时预览；没有参数时从本地偏好恢复。
  const themeValue = theme || readPreference('fdn-theme') || 'auto';
  const primaryValue = primary || readPreference('fdn-theme-primary') || 'teal';
  const accentValue = accent || readPreference('fdn-theme-accent') || 'green';
  const body = document.body;

  // 先清除所有旧的 MDUI 主题类，避免用户多次切换后同时残留多个颜色类。
  [...body.classList]
    .filter((className) => className.startsWith('mdui-theme-'))
    .forEach((className) => body.classList.remove(className));
  body.classList.add(`mdui-theme-layout-${themeValue}`);
  body.classList.add(`mdui-theme-primary-${primaryValue}`);
  body.classList.add(`mdui-theme-accent-${accentValue}`);

  // 只补齐缺省值，绝不覆盖用户已经保存的选择。
  if (!readPreference('fdn-theme')) writePreference('fdn-theme', 'auto');
  if (!readPreference('fdn-theme-primary')) writePreference('fdn-theme-primary', 'teal');
  if (!readPreference('fdn-theme-accent')) writePreference('fdn-theme-accent', 'green');
}
