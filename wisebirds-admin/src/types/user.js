/** @namespace User */
/**
 *  @typedef {object} User.Base
 *  @property {number} id - 사용자 ID
 *  @property {string} email - 이메일 로그인 아이디
 *  @property {string} name - 이름
 */
/**
 *  @typedef {
 *    User.Base &
 *    {
 *      company: { id: number, name: string }
 *    }
 *  } User.Auth
 *  @property {{ id: number, name: string }} company - 회사 정보
 */

/**
 *  @typedef {
 *    User.Base &
 *    {
 *      last_login_at: string|Date
 *    }
 *  } User.Content
 *  @property {string|Date} last_login_at - 마지막 로그인 일시
 */