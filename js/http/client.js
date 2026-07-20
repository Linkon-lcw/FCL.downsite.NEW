// 仅缓存本页生命周期内的“进行中/成功”请求；刷新页面后由浏览器 HTTP 缓存接管。
// 键同时包含响应类型，避免同一 URL 被按 JSON 与文本两种方式解析时发生混用。
const responseCache = new Map();

/**
 * 所有网络层错误的统一表示。
 * kind 用于 controller 决定提示语和取消后的 UI 行为，不能只依赖浏览器各异的 Error.message。
 */
export class HttpError extends Error {
  constructor(message, { kind = 'network', url = '', status = null, cause } = {}) {
    super(message, { cause });
    this.name = 'HttpError';
    this.kind = kind;
    this.url = url;
    this.status = status;
  }
}

function createRequestSignal(callerSignal, timeoutMs) {
  // 不直接给 fetch 使用调用者 signal：这里额外合并了超时信号，任一方取消都会结束请求。
  const controller = new AbortController();
  let timedOut = false;

  // 保留外部取消原因，方便调用方区分“用户切换线路”和普通网络失败。
  const abortFromCaller = () => controller.abort(callerSignal.reason);
  if (callerSignal) {
    if (callerSignal.aborted) abortFromCaller();
    else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  // AbortController 本身不区分超时与用户取消，因此额外记录 timedOut 作为分类依据。
  const timeoutId = timeoutMs > 0
    ? window.setTimeout(() => {
      timedOut = true;
      controller.abort(new DOMException('请求超时', 'TimeoutError'));
    }, timeoutMs)
    : null;

  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    cleanup() {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      callerSignal?.removeEventListener('abort', abortFromCaller);
    },
  };
}

async function request(url, responseType, options = {}) {
  const {
    signal,
    timeoutMs = 15000,
    cache = false,
  } = options;
  const cacheKey = `${responseType}:${url}`;

  // 缓存 Promise 而不是解析后的值：同一时刻多个消费者只会真正发起一次请求。
  if (cache && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const requestPromise = (async () => {
    const requestSignal = createRequestSignal(signal, timeoutMs);
    try {
      // 所有业务代码只能经由本模块请求，确保 HTTP 状态与解析错误不会被遗漏。
      const response = await fetch(url, { signal: requestSignal.signal });
      if (!response.ok) {
        throw new HttpError(`HTTP ${response.status}：${response.statusText || '请求失败'}`, {
          kind: 'http',
          url,
          status: response.status,
        });
      }

      try {
        return responseType === 'json' ? await response.json() : await response.text();
      } catch (cause) {
        throw new HttpError(responseType === 'json' ? '服务器返回的 JSON 格式不正确' : '无法读取响应内容', {
          kind: 'parse',
          url,
          cause,
        });
      }
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // 判断顺序不能颠倒：超时同样会触发 abort，需要优先给用户“超时”而非“已取消”。
      if (requestSignal.didTimeOut()) {
        throw new HttpError(`请求超时：${url}`, { kind: 'timeout', url, cause: error });
      }
      if (requestSignal.signal.aborted) {
        throw new HttpError('加载已取消', { kind: 'abort', url, cause: error });
      }
      throw new HttpError(`网络请求失败：${url}`, { kind: 'network', url, cause: error });
    } finally {
      requestSignal.cleanup();
    }
  })();

  if (cache) {
    responseCache.set(cacheKey, requestPromise);
    // 失败请求不可缓存，否则点击“重试”会永远复用同一个 rejected Promise。
    requestPromise.catch(() => responseCache.delete(cacheKey));
  }
  return requestPromise;
}

export function getJSON(url, options) {
  return request(url, 'json', options);
}

export function getText(url, options) {
  return request(url, 'text', options);
}

export function clearResponseCache(url) {
  // url 为空时清空本页全部缓存；传入 URL 时只失效该资源的 JSON/文本两个变体。
  for (const key of responseCache.keys()) {
    if (!url || key.endsWith(`:${url}`)) responseCache.delete(key);
  }
}
