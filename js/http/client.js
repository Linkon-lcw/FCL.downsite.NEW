const responseCache = new Map();

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
  const controller = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => controller.abort(callerSignal.reason);
  if (callerSignal) {
    if (callerSignal.aborted) abortFromCaller();
    else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

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

  if (cache && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const requestPromise = (async () => {
    const requestSignal = createRequestSignal(signal, timeoutMs);
    try {
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
  for (const key of responseCache.keys()) {
    if (!url || key.endsWith(`:${url}`)) responseCache.delete(key);
  }
}
