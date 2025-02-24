const isProduction = import.meta.env.MODE === 'production';
const protocol = isProduction ? 'https://' : 'http://';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const port = isProduction ? '' : `:${import.meta.env.VITE_API_PORT}`;

/**
 *  요청을 가로채서 사전에 설정을 수정하는 함수
 *  @param {string} url - 요청 url
 *  @param {RequestInit} config - 요청 설정(method: GET|POST 등등, headers 설정, params, body 등)
 *  @return {RequestInit & { url: string }} - 수정된 요청 설정값.
 */
export function requestInterceptor(url, config) {
  const newConfig = { ...config, url };

  // 공통 헤더 추가
  newConfig.headers = {
    ...config.headers,
    'Content-Type': 'application/json',
  };

  const newUrl = new URL(`${protocol}${baseUrl}${port}${url.startsWith('/') ? url : '/' + url}`);
  // params 가 있는 요청의 경우 query string 이 필요하므로 보간해준다.
  if (newConfig.params) {
    Object.entries(newConfig.params).forEach(([key, value]) => {
      newUrl.searchParams.append(key, JSON.stringify(value));
    });
  }
  newConfig.url = newUrl.toString();

  if (
    !(newConfig.body instanceof Blob ||
      newConfig.body instanceof ArrayBuffer ||
      newConfig.body instanceof FormData ||
      newConfig.body instanceof URLSearchParams ||
      typeof newConfig.body === 'string')
  ) {
    newConfig.body = JSON.stringify(newConfig.body);
  }
  
  return /** @type {RequestInit & { url: string }} */newConfig;
}

/**
 *  응답을 가로채서 포매팅 처리하는 함수
 *  @param {Response} response - 서버의 응답 원본
 *  @return {Promise<*>} - 포매팅된 응답
 *  @throws {Error} - 요청이 실패했을 경우
 */
export async function responseInterceptor(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(response.statusText);
    error.status = response.status;
    error.data = errorData;

    throw error;
  }
  
  return await response.json();
}