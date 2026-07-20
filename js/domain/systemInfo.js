const ARCHITECTURES = [
  { pattern: /aarch64|arm64|armv8/i, name: 'arm64-v8a' },
  { pattern: /armeabi-v7a|armv7|\barm\b/i, name: 'armeabi-v7a' },
  { pattern: /x86_64|x64|amd64/i, name: 'x86_64' },
  { pattern: /\bx86\b|i[36]86/i, name: 'x86' },
];

export function detectSystemInfo() {
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
  if (item.architecture) return item.architecture;
  const source = `${item.downloadUrl || ''} ${item.name || ''}`;
  const matched = ARCHITECTURES.find(({ pattern }) => pattern.test(source));
  if (matched) return matched.name;
  if (source.includes('ZalithLauncher')) return 'all';
  return '';
}
