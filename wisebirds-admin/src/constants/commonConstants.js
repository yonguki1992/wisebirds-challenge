import {deepFreeze} from '@/utils/functions/useJsUtils.js';

export const PERMISSIONS_CODE = deepFreeze({
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VIEWER: 'VIEWER',
});

export const PERMISSIONS_NAME = deepFreeze({
  ADMIN: '어드민',
  MANAGER: '매니저',
  VIEWER: '뷰어',
});

export const SESSION_OVER = '세션이 만료되었습니다. 다시 접속해주세요.';
export const PAGE_PERMISSION_DENIED = '페이지 접근 권한이 없습니다.';
export const COMMON_ERROR_MESSAGE = `에러가 발생했습니다.
                                              같은 현상이 반복되면 고객센터로 문의 바랍니다.`;