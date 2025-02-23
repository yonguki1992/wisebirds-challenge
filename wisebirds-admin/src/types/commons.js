/** @namespace Type */
/**
 *  @typedef {function(): T} Type.Getter<T>
 *  @template T
 */
/**
 *  @description 빈 객체(ex: {}) 타입 정의
 *  @typedef {Record<string, never>} Type.EmptyObject
 */

/** @typedef {'ADMIN'|'MANAGER'|'VIEWER'} Type.Permission */
/** @typedef {number|string} Type.NumberLike */
/** @typedef {'Y'|'N'} Type.YesOrNo */
/** @typedef {Type.YesOrNo|boolean} Type.BooleanLike */


/**
 *  @typedef {Partial<T> & { result: boolean }} Type.ResultWrapper<T>
 *  @description 함수 결과값 반환 wrapper
 *  @template T
 */

/**
 *  @typedef {({ name: string, value: V } & Partial<T>)} Type.ItemOption<V, T>
 *  @description 아이템 옵션. name - 옵션명(display) | value - 옵션값(value)
 *  @template V
 *  @template T
 */

/**
 *  @typedef {object} Type.PagingInfo
 *  @description 페이징 정보
 *  @property {number} totalElements - 조회 결과 목록 수
 *  @property {number} page - 현재 페이지 번호
 *  @property {number} size - 한 페이지에 보여줄 Row 수
 */
/**
 *  @typedef {
 *    function (this: Type.PayloadBuilder<T>, key: KEY, value: T[KEY]): Omit<Type.PayloadBuilder<T>, KEY>
 *  } Type.AppendPayload<T, KEY>
 *  @this {Type.PayloadBuilder<T>}
 *  @description
 *  @template T
 *  @template KEY
 */
/**
 *  @typedef {
 *    {
 *      build: (function(): T)
 *    } & {
 *      [P in keyof T]: (function(value: T[P]): Omit<Type.PayloadBuilder<T>, P>)
 *    }
 *  } Type.PayloadBuilder<T>
 *  @description payload 빌더 타입 정의.<br>
 *  매번 객체 리터럴로 관리하려면 힘들것 같아서 도입
 *  @property {function(): T} build - 객체 빌딩 메서드
 *  @template T
 */