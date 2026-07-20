// 顺序很重要：arm64/x86_64 必须先于更宽泛的 arm/x86 匹配。
const ARCHITECTURES = [
  { pattern: /aarch64|arm64|armv8/i, name: 'arm64-v8a' },
  { pattern: /armeabi-v7a|armv7|\barm\b/i, name: 'armeabi-v7a' },
  { pattern: /x86_64|x64|amd64/i, name: 'x86_64' },
  { pattern: /\bx86\b|i[36]86/i, name: 'x86' },
];

export function detectSystemInfo() {
  // UAParser 是下载页专属的可选 CDN 依赖。加载失败时仍允许用户手动选择架构。
  if (typeof window.UAParser !== 'function') {
    return { osName: '', browserName: '', cpuArchitecture: '', matchedArchitecture: null };
  }
  const result = new window.UAParser().getResult();
  const cpuArchitecture = result.cpu.architecture || navigator.platform || '';
  return {
    osName: result.os.name || '',
    browserName: result.browser.name || '',
    cpuArchitecture,
    matchedArchitecture: ARCHITECTURES.find(({ pattern }) => pattern.test(cpuArchitecture))?.name || null,
  };
}

export function inferArchitecture(item) {
  // 线路显式提供的 architecture 优先级最高；文件名推断仅作为兼容旧镜像的后备。
  if (item.architecture) return item.architecture;
  const source = `${item.downloadUrl || ''} ${item.name || ''}`;
  const matched = ARCHITECTURES.find(({ pattern }) => pattern.test(source));
  if (matched) return matched.name;
  if (source.includes('ZalithLauncher')) return 'all';
  return '';
}
