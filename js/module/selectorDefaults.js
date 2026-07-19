import utils from './utils.js';

const PREFIX = '选择器默认回调：';

const ARCH_MAP = {
  'all': 'all',
  'arm64-v8a': 'arm64-v8a',
  'arm64': 'arm64-v8a',
  'armeabi-v7a': 'armeabi-v7a',
  'arm': 'armeabi-v7a',
  'x86_64': 'x86_64',
  'x86': 'x86',
};

const COLUMN_HEADERS = ['操作', '架构', '描述', '大小', '显示名称', 'URL'];

function inferArchFromStr(str) {
  if (!str) return '';
  const key = Object.keys(ARCH_MAP).find(k => str.includes(k));
  return ARCH_MAP[key] || '';
}

function inferArchForZL(url) {
  if (url.includes('ZalithLauncher') && !Object.values(ARCH_MAP).includes(url)) {
    return 'all';
  }
  return '';
}

export function defaultCreateSelectElement(items) {
  const select = document.createElement('select');
  select.classList.add('mdui-select', 'mdui-block');

  const fragment = document.createDocumentFragment();
  const groupOptions = {};

  items.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name || '(无名称)';
    const groupName = item.type || '';
    if (!groupOptions[groupName]) {
      groupOptions[groupName] = [];
    }
    groupOptions[groupName].push(option);
  });

  for (const [groupName, options] of Object.entries(groupOptions)) {
    if (groupName) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groupName;
      options.forEach(option => optgroup.appendChild(option));
      fragment.appendChild(optgroup);
    } else {
      options.forEach(option => fragment.appendChild(option));
    }
  }

  select.appendChild(fragment);
  return select;
}

export function defaultCreateDescriptionElement() {
  const descDiv = document.createElement('div');
  descDiv.className = 'description';
  return descDiv;
}

export function defaultCreateDownloadElement(item, onDownload, debounceDelay, matchedArch) {
  const tr = document.createElement('tr');
  const tdOperation = document.createElement('td');
  const tdArch = document.createElement('td');
  const tdDes = document.createElement('td');
  const tdSize = document.createElement('td');
  const tdName = document.createElement('td');
  const tdUrl = document.createElement('td');

  const btnDl = document.createElement('a');
  btnDl.innerText = item.btnText || '下载';
  btnDl.href = item.url;
  btnDl.target = '_blank';
  btnDl.className = 'mdui-btn mdui-btn-block mdui-btn-raised mdui-ripple';
  tdOperation.appendChild(btnDl);

  tdArch.innerText = item.arch
    || inferArchFromStr(item.url)
    || inferArchFromStr(item.name)
    || inferArchForZL(item.url)
    || '';

  if (tdArch.innerText === matchedArch) {
    tr.id = 'matchedArchRow';
  }

  tdDes.innerText = item.description || '';
  tdSize.innerText = utils.formatBytes(item.size) || '';
  tdName.innerText = item.name || '';

  const tdUrlA = document.createElement('a');
  tdUrlA.innerText = item.url;
  tdUrlA.href = item.url;
  tdUrlA.target = '_blank';
  tdUrl.appendChild(tdUrlA);
  tdUrl.classList.value = 'mdui-typo';

  tr.appendChild(tdOperation);
  tr.appendChild(tdArch);
  tr.appendChild(tdDes);
  tr.appendChild(tdSize);
  tr.appendChild(tdName);
  tr.appendChild(tdUrl);

  btnDl.dataset.originalText = btnDl.innerText;
  btnDl.dataset.debounceDelay = debounceDelay;

  btnDl.addEventListener('click', (e) => {
    if (btnDl.disabled) {
      e.preventDefault();
      return;
    }
    if (onDownload) {
      onDownload(item, e);
    }
  });

  return tr;
}

export function defaultRenderError(message, level, container, enableControls, clearLevel) {
  console.log(`${PREFIX}渲染错误：${message}`);
  enableControls();
  clearLevel(level);
  const errorEl = document.createElement('div');
  const errorInfo = handleError(new Error(message), {
    defaultMessage: `出错：${message}`,
  });
  errorEl.textContent = errorInfo.message;
  errorEl.style.color = errorInfo.color;
  container.appendChild(errorEl);
}

/**
 * 统一的错误处理函数
 * @param {Error} error - 错误对象
 * @param {Object} options - 配置选项
 * @param {string} [options.defaultMessage] - 默认错误消息
 * @param {boolean} [options.isUserFriendly] - 是否返回用户友好的消息
 * @returns {Object} - 处理后的错误信息
 */
export function handleError(error, options = {}) {
  const {
    defaultMessage = '出错：' + error.message,
    isUserFriendly = true
  } = options;

  // 检查是否为取消操作导致的错误
  const isAbortError = error.name === 'AbortError' ||
    error.message.includes('The operation was aborted');

  if (isAbortError && isUserFriendly) {
    return {
      message: '强行终止加载。（' + defaultMessage + '）',
      isAbort: true,
      isUserFriendly: true,
    };
  }

  // 其他类型的错误
  return {
    message: defaultMessage,
    isAbort: false,
    isUserFriendly: false,
    color: '#f00',
    originalError: error
  };
}

