import {requestInterceptor, responseInterceptor} from '@/utils/http/fetchInterceptor.js';


export function fetchClient(url, options = {}) {
  // 요청 인터셉터 적용 예정
  const config = requestInterceptor(url, options);
  return fetch(config.url, config)
    .then(responseInterceptor)
    .catch((error) => {
      console.error("Error occurred on fetch:>> ", error);
      throw error;
    });
}