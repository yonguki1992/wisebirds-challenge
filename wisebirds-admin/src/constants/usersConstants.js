import {deepFreeze} from '@/utils/functions/useJsUtils.js';

export const USERS_ERROR_EMAIL_EMPTY_LABEL = '아이디(이메일)을 입력하세요.';
export const USERS_ERROR_EMAIL_INVALID_LABEL = '올바른 이메일 주소를 입력하세요.';
export const USERS_ERROR_EMAIL_ALREADY_EXISTS_LABEL = '이미 사용중인 이메일입니다. 다른 이메일을 입력하세요.';

export const USERS_VALID_EMAIL_REGEX = "^([a-z]|[A-Z]|[0-9]|\\_|\\-|\\.).{0,30}\\@([a-z]|[A-Z]|[0-9]|\\_|\\-|\\.).{0,30}\\.([a-z]|[A-Z]|[0-9]).{0,10}";
export const USERS_VALID_EMAIL_LENGTH_REGEX = "^.{9,50}$";


export const USERS_ERROR_PASSWORD_EMPTY_LABEL = '비밀번호를 입력하세요.';
export const USERS_ERROR_PASSWORD_INVALID_PLACEHOLDER = '영문, 숫자, 특수문자 조합 8~15자';
export const USERS_ERROR_PASSWORD_INVALID_LABEL = '8~15자 영문, 숫자, 특수문자를 사용하세요';
export const USERS_VALID_PASSWORD_REGEX = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*\\W).{8,15}$";

export const USERS_ERROR_CONFIRM_PASSWORD_EMPTY_LABEL = '비밀번호를 입력하세요.';
export const USERS_ERROR_CONFIRM_PASSWORD_MISMATCH_LABEL = '비밀번호가 일치하지 않습니다.';

export const USERS_ERROR_NAME_EMPTY_LABEL = '이름을 입력하세요.';
export const USERS_ERROR_NAME_INVALID_LABEL = '이름을 올바르게 입력하세요. (숫자, 특수문자, 공백 입력 불가)';
export const USERS_VALID_NAME_REGEX = deepFreeze({
  pattern: "^[a-zA-Z\\uac00-\\ud7a3]{1,16}$",
  flags: "u",
});