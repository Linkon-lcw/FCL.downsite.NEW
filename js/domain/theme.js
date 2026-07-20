import { readPreference, writePreference } from './preferences.js';

export function applyTheme(theme, primary, accent) {
  const themeValue = theme || readPreference('fdn-theme') || 'auto';
  const primaryValue = primary || readPreference('fdn-theme-primary') || 'teal';
  const accentValue = accent || readPreference('fdn-theme-accent') || 'green';
  const body = document.body;

  [...body.classList]
    .filter((className) => className.startsWith('mdui-theme-'))
    .forEach((className) => body.classList.remove(className));
  body.classList.add(`mdui-theme-layout-${themeValue}`);
  body.classList.add(`mdui-theme-primary-${primaryValue}`);
  body.classList.add(`mdui-theme-accent-${accentValue}`);

  if (!readPreference('fdn-theme')) writePreference('fdn-theme', 'auto');
  if (!readPreference('fdn-theme-primary')) writePreference('fdn-theme-primary', 'teal');
  if (!readPreference('fdn-theme-accent')) writePreference('fdn-theme-accent', 'green');
}
