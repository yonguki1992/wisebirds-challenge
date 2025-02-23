import dayjs from 'dayjs'
import { debounce, throttle } from "lodash-es";
import { ResultWrapperFactory } from "@/utils/factory/ResultWrapperFactory.js";
/**  @namespace Match */
/**
 *   @typedef {function(v: R): R} Match.Bypass<R>
 *   @template R
 */
/**
 *   @typedef {function( predicate: Match.Predicate<V>, callback: Match.Action<V, R> ): Match.Type<V, R>} Match.On<V, R>
 *   @template V
 *   @template R
 */
/**
 *   @typedef {function( callback: Match.Action<V, R> ): Omit<Match.Type<V, R>, 'on'|'otherWise'>} Match.OtherWise<V, R>
 *   @template V
 *   @template R
 */
/**
 *   @typedef {function(): R|undefined} Match.End<R>
 *   @template R
 */
/**  @typedef {function(): true} Match.True */
/**  @typedef {function(): false} Match.False */
/**
 *   @typedef {function(v?: V): boolean} Match.Predicate<V>
 *   @template V
 */
/**
 *   @typedef {function(v?: V): R} Match.Action<V, R>
 *   @template V
 *   @template R
 */
/**
 *   @typedef {object} Match.Options<V, R>
 *   @property {Match.Predicate<V>} predicate
 *   @property {Match.Action<V, R>} action
 *   @template V
 *   @template R
 */
/**
 *   if else 및 switch 대신 체이닝 방식으로 특정 조건을 처리하기
 *   @typedef {object} Match.Type<V, R>
 *   @property {Match.On<V, R>} on - 특정 조건일때 처리
 *   @property {Match.OtherWise<V, R>} otherWise - 나머지 조건 처리
 *   @property {Match.End<R>} caseEnd - 조건 처리종료
 *   @template V - 타겟 값
 *   @template R - 결과
 */
/**
 *   전통적인 if-else 나 switch 를 함수형 선언형태로 사용할 수 있게 도와주는 함수<br>
 *   Match.Type 은 on, otherWise, caseEnd 세 메서드를 가지고 있는데<br>
 *   필요한 만큼 on 으로 체이닝하면 됨.<br>
 *   기본값(if-else 로 치면 else, switch 는 default case)이 필요하면<br>
 *   가장 마지막에 otherWise 메서드를 체이닝한다<br>
 *   필요없으면 caseEnd 를 체이닝. 대신 결과값은 없을 수도 있음.
 *   ```javascript
 *   // ex)
 *   const resCd = 404; // 예를들면 not found 에러같은거
 *   useMatcher(resCd)
 *       .on(code => Array.from({ length: 9 }, (_, idx) => 400+idx).includes(code), code => {
 *           // 404 니까 여기에 걸리겠지~~
 *           console.error(`client error! error code :>> ${code}`);
 *       })
 *       .on(code => Array.from({ length: 12 }, (_, idx) => 500+idx).includes(code), code => {
 *           console.error(`internal server error! error code :>> ${code}`);
 *       })
 *       // if-else 의 else | switch 의 default case 역할
 *       .otherWise(code => {
 *           console.log(`request success! response code :>> ${code}`);
 *       })
 *       // 항상 mather 의 마지막은 caseEnd 로 종료
 *       .caseEnd()
 *   ```
 *   @param {V} [value]
 *   @return {Match.Type<V, R>}
 *   @template V - 타겟 값
 *   @template R - 결과
 */
export function useMatcher(value) {
  let matched = false; // 조건 충족 여부 추적
  let result; // 최종 결과 저장
  const _validateCallback = (callback) => {
    if (typeof callback !== "function") {
      throw new Error("Provided callback is not a function.");
    }
  };
  const _validatePredicate = (predicate) => {
    if (typeof predicate !== "function") {
      throw new Error("Provided predicate is not a function.");
    }
  };

  return {
    /**
     *  특정 조건에 따라 동작을 정의
     *  @param {Match.Predicate<V>} predicate - 조건
     *  @param {Match.Action<V, R>} callback - 조건 충족 시 실행할 콜백
     *  @return {Match.Type<V, R>} - 체이닝 가능
     *  @template V - 타겟 값
     *  @template R - 결과
     */
    on(predicate, callback) {
      _validatePredicate(predicate);
      _validateCallback(callback);
      if (!matched && predicate(value)) {
        matched = true;
        result = callback(value);
      }
      return this; // 체이닝 유지
    },
    /**
     *  모든 조건이 만족되지 않았을 때 실행할 기본 동작
     *  @param {Match.Action<V, R>} callback - 기본 동작 콜백
     *  @return {Omit<Match.Type<V, R>, 'on'|'otherWise'>} - `on`과 `otherWise`를 제외한 객체 (체이닝 제한)
     *  @template V - 타겟 값
     *  @template R - 결과
     */
    otherWise(callback) {
      _validateCallback(callback);
      if (!matched) {
        result = callback(value);
        matched = true; // 기본값도 매칭된 것으로 처리
      }
      // `on`과 `otherWise`를 제거한 객체 반환
      const { on: _, otherWise: __, ...others } = /** @type {Match.Type<V, R>} */ this;
      return others;
    },
    /**
     * 조건 처리 종료
     * @return {R | undefined} - 매칭된 결과 또는 undefined
     * @template R
     */
    caseEnd() {
      return result; // 매칭된 조건이 없으면 undefined 반환
    },
  };
}
/**
 *  주어진 값이 유효한지 확인합니다.
 *  @param {any} value - The value to check.
 *  @param {boolean} [required=true] - string, array, object 등은 빈 값도 유효한지 결정하는 플래그.
 *  @param {Set} [seen=new Set()] - 순환참조를 회피하기 위해 이미 참조한 값인지 체크
 *  @returns {boolean} - 값이 유효하면 true를 반환하고, 그렇지 않으면 false를 반환합니다.
 */
export function isValidValue(value, required = true, seen = new Set()) {
  const valueType = typeof value;
  if (valueType === "undefined" || value === null) {
    return false;
  }
  // 이미 확인한 값인지 확인합니다.
  if (seen.has(value)) {
    return true;
  }
  switch (valueType) {
    case "function":
    case "boolean":
    case "symbol":
      return true;
    case "number":
      return !isNaN(value);
    case "string":
    case "bigint":
      return !required || value.toString().trim().length !== 0;
    case "object":
      // 확인한 값을 추가합니다.
      seen.add(value);
      if (!required) {
        return true;
      }
      if (Array.isArray(value)) {
        return value.length !== 0;
      }
      if (value instanceof Map || value instanceof Set) {
        return value.size !== 0;
      }
      if (value instanceof Element) {
        return true;
      }
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return false;
      }
      let res = false;
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          // 재귀적으로 isValidValue를 호출할 때, 새로운 seen Set을 전달합니다.
          if (isValidValue(value[key], false, seen)) {
            res = true;
            break;
          }
        }
      }
      return res;
    default:
      return false;
  }
}
/**
 *  useMatcher 사용 시 callback 에 v => v 만 필요할 경우가 생기는데<br>
 *  매번 같은 코드쓸 필요 없이 bypass 가 필요할 경우 사용<br>
 *  ex) useMatcher( value ).on( isValidValue, bypassValue ).caseEnd()
 *  @type {Match.Bypass<*>}
 *  @param {*} v
 *  @return {*}
 */
export const bypassValue = (v) => v;
/**
 *  검증함수(checkValidation)에 사용하는 기본 Action<br>
 *  내부 로직을 커스텀해서 거짓을 반환하면서 특정 로직도 동작하게 만들면 된다.
 *  @type {Match.False}
 *  @return {false} - 항상 false
 *  @see {useMatcher}
 *  @see {useValidatePayload}
 */
export const returnFalse = () => false;
/**
 *  검증함수(checkValidation)에 사용하는 기본 Action<br>
 *  내부 로직을 커스텀해서 참을 반환하면서 특정 로직도 동작하게 만들면 된다.
 *  @type {Match.True}
 *  @return {true} - 항상 true
 *  @see {useMatcher}
 *  @see {useValidatePayload}
 */
export const returnTrue = () => true;
/**
 *  기본 옵션 정의
 *  @type {Match.Options<*, false>}
 */
export const defaultValidationOption = {
  predicate: (v) => !isValidValue(v),
  action: returnFalse,
};
/**
 *  기본 옵션 정의
 *  @type {Match.Options<*, *>}
 */
export const defaultFilterOption = {
  predicate: isValidValue,
  action: bypassValue,
};
/**
 *  useMatcher 만든김에 object 형태의 폼 유효성 검증하려고 만든 함수<br>
 *  검증 로직(predicate)결과값에 따라 true 혹은 false 를 반환함.
 *  @param {Payload} payload - 검증할 object
 *  @param {
 *      Partial<Record<keyof Payload, Match.Options<any, boolean>>> &
 *      { default?: Match.Options<any, boolean> } &
 *      { orderedKeys?: (keyof Payload | string)[] }
 *  } [option] - 검증로직 커스텀
 *  @param {Match.True} [success] - 성공시 true 반환과 함께 어떤 기능(callback) 실행할 것인지.
 *  @return {Type.ResultWrapper<{ errors: { key?:string, message?: string }[] }>}
 *  @template Payload
 *  @see {useMatcher}
 *  @see {Match.Type}
 *  @see {Match.Options}
 *  @see {Match.Action}
 */
export function useValidatePayload(
  payload,
  option = { default: defaultValidationOption },
  success = returnTrue
) {
  if (!isValidValue(payload) || typeof payload !== "object") {
    return ResultWrapperFactory.create({ errors: [{ message: "Invalid payload type" }] });
  }
  const { orderedKeys = Object.keys(payload), ...targetOption } =
    typeof option === "object" ? option : { default: defaultValidationOption };
  const errors = [];
  const result = orderedKeys
    .reduce((matcher, key) => {
      const { predicate, action: failure } =
      targetOption[key] || targetOption.default || defaultValidationOption;
      return matcher.on(
        () => predicate(payload[key]),
        () => {
          errors.push({ key, message: `${key} failed validation.` });
          return failure(payload[key]) ?? false;
        }
      );
    }, /** @type {Match.Type<any, boolean>} */ useMatcher())
    .otherWise(success)
    .caseEnd();
  return ResultWrapperFactory.create({ result, errors });
}
/**
 *  useMatcher 만든 김에 object 쭉정이 속성 필터링 용도의 함수<br>
 *  필터링 로직(predicate)결과값에 따라 해당 속성을 bypass 하거나 제거 한다.
 *  @param {Payload} payload - 필터링할 object
 *  @param {Partial<Record<keyof Payload, Match.Options<any, any>>> & { default?: Match.Options<any, any> }} [option] - 필터링로직 커스텀
 *  @return {Partial<Payload>} - 필터링로직 결과로 새로 태어난 object
 *  @template Payload
 *  @see {useMatcher}
 *  @see {Match.Type}
 *  @see {Match.Options}
 *  @see {Match.Action}
 */
export function useFilteringPayload(payload, option = { default: defaultFilterOption }) {
  if (!isValidValue(payload) || typeof payload !== "object") {
    return payload;
  }
  const targetOption = typeof option === "object" ? option : { default: defaultFilterOption };
  return Object.keys(payload).reduce((acc, key) => {
    const { predicate, action: bypass } =
    targetOption[key] || targetOption.default || defaultFilterOption;
    const res = useMatcher(payload[key]).on(predicate, bypass).caseEnd();
    if (isValidValue(res, false)) {
      acc[key] = res;
    }
    return acc;
  }, {});
}


export function checkUriEncode(targetValue) {
  return /%[0-9A-Fa-f]{2}/g.test(targetValue);
}
export function safeEncodeURIComponent(targetValue) {
  if (!isValidValue(targetValue)) return "";
  try {
    return encodeURIComponent(targetValue);
  } catch (err) {
    return targetValue;
  }
}
export function safeDecodeURIComponent(targetValue) {
  if (!isValidValue(targetValue)) return "";
  if (!checkUriEncode(targetValue)) return targetValue;
  try {
    return decodeURIComponent(targetValue);
  } catch (err) {
    return targetValue;
  }
}


/**
 *  마지막 호출 이후 주어진 시간(ms)이 지나야 실제로 작업이 실행됨<br>
 *  이벤트가 연속적으로 발생하는 것을 방지함.
 *  @param {function(...args: *[]): void} targetTask - 동작시킬 코드
 *  @param {number} ms - delay 줄 milliseconds 값
 *  @param {DebounceSettingsLeading} [option] - 디바운스 옵션
 *  @return {object} - 디바운스된 함수 객체
 *  @property {function(...args: *[]): void} [return] - 지연된 작업을 실행하는 함수
 *  @property {function(): void} [return.cancel] - 대기 중인 작업을 취소하는 함수
 *  @property {function(): void} [return.flush] - 대기 중인 작업을 즉시 실행하는 함수
 */
export function useDebounceTask(targetTask, ms, option) {
  return debounce(targetTask, ms, option);
}
/**
 *  state.inThrottle === true 인 동안에는 추가 작업이 실행되지 않음<br>
 *  주어진 시간(ms)이 지나면 추가 작업을 할 수 있음.
 *  @param {function(...args: *[]): any} targetTask - 동작시킬 코드
 *  @param {number} ms - delay 줄 milliseconds 값
 *  @param {DebounceSettingsLeading} [option] - 스로틀 옵션
 *  @return {object} - 스로틀링된 함수 객체
 *  @property {function(...args: *[]): any} [return] - 지연된 작업을 실행하는 함수
 *  @property {function(): void} [return.cancel] - 대기 중인 작업을 취소하는 함수
 *  @property {function(): any} [return.flush] - 대기 중인 작업을 즉시 실행하는 함수
 */
export function useThrottleTask(targetTask, ms, option) {
  return throttle(targetTask, ms, option);
}

/**
 *. Promise + setTimeout = sleep
 *  @param {number} timeout - 시간값(밀리초)
 *  @param {boolean|Error} [rejected=false] -
 *  @param {object} [timerObj={}] 타이머 결과
 *  @param {ReturnType<typeof setTimeout>} [timerObj.timer] 타이머
 *  @return {Promise<void>}
 */
export function useTimeoutTask(timeout, timerObj = {}, rejected = false) {
  return new Promise((resolve, reject) => {
    timerObj.timer = setTimeout(
      () =>
        /**@type{Match.Type<boolean|Error, void>}*/
        useMatcher(rejected)
          .on(
            (v) => !v,
            () => resolve()
          )
          .on(
            (v) => typeof v === "boolean" && v,
            () => reject()
          )
          .on((v) => typeof v === "object", reject)
          .caseEnd(),
      timeout
    );
  });
}

/**
 *  Object.freeze 는 객체를 동결시켜 읽기 전용(readonly)으로 만드는 메서드.<br>
 *  하지만 깊이가 1보다 깊은 객체에 대해서는 동결시키지 않기 때문에<br>
 *  객체 하위 모든 properties 를 동결시키는 메서드 추가함.<br>
 *  ```javascript
 *  // ex)
 *  "use strict";
 *  const freezeObj = Object.freeze({ nestedObj: { propKey: 456 } });
 *  freezeObj.nestedObj = { otherKey: 123 }; // Uncaught TypeError: Cannot assign to read only property 'nestedObj' of object
 *  freezeObj.nestedObj.propKey = 123; // freezeObj => { nestedObj: { propKey: 123 } }
 *  freezeObj.nestedObj.addedKey = "abc"; // freezeObj =>{nestedObj: { propKey: 123, addedKey: "abc" }}
 *
 *  const deepFreezeObj = deepFreeze({ nestedObj: { propKey: 456 } });
 *  freezeObj.nestedObj = { otherKey: 123 }; // Uncaught TypeError: Cannot assign to read only property 'nestedObj' of object
 *  freezeObj.nestedObj.propKey = 123; // Uncaught TypeError: Cannot assign to read only property 'propKey' of object
 *  freezeObj.nestedObj.addedKey = "abc"; // Uncaught TypeError: Cannot add property addedKey, object is not extensible
 *  ```
 *  @param {T} obj - 동결시킬 객체
 *  @return {T} - 동결된 객체
 *  @template T
 */
export function deepFreeze(obj) {
  // Retrieve the property names defined on object
  const propNames = Reflect.ownKeys(obj);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = obj[name];

    if ((value && typeof value === "object") || typeof value === "function") {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
}

/**
 *  함수 실행시간 알아보려고 만든 Wrapper<br>
 *  테스트해보니 3초 정도 timeOut 으로 멈춰놓으면<br>
 *  3.005 초 나오니까 아주까지는 아니어도 근사하게 동작시간 체크할 수 있음.
 *  @param {function(): *} task
 *  @param {string} label
 *  @return {Promise<*>}
 */
export async function useRecordTime(task, label) {
  console.time(label);
  try {
    return await task();
  } catch (error) {
    console.error(error);
    return error;
  } finally {
    console.timeEnd(label);
  }
}

export function useDownloadFileUrl(url, fileName = "") {
  if (isValidValue(url) === false) {
    return;
  }
  const link = document.createElement("a");
  link.setAttribute("href", url);
  let _fileName;
  if (isValidValue(fileName) === true) {
    _fileName = fileName;
  } else {
    // 파일명으로 쓸 수 없는 특문 전부 _(underscore)로 바꿈
    _fileName = url.replace(/\/|\\|\*|\:|\?|\"|\<|\>|\|/g, "_");
  }
  link.setAttribute("download", _fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 *  이미지 로딩 완료되었는지 체크.
 *  @param {string} imgSrcUrl - upload 완료된 이미지 url
 *  @return {Promise<boolean>} - 이미지 로딩이 완료되면 resolve(true) | 아니면 resolve(false)
 */
export function isValidateImgSrcUrl(imgSrcUrl) {
  let img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = (err) => reject(err);
    img.src = imgSrcUrl;
  })
    .catch(() => {
      // console.log("err :>> ", err);
      return false;
    })
    .finally(() => {
      img = null;
    });
}

export function tryParseJson(data, option = {}) {
  const { defaultValue = null, isLogging = false } = option;
  if (typeof data !== "string") {
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    isLogging && console.error(err);
    return defaultValue;
  }
}

export function updateState(state, key, newValue) {
  const oldValue = state[key];
  if (oldValue !== newValue) {
    state[key] = newValue;
  }
  return state;
}

export function updateStates(state, updateData, defaultData) {
  if (typeof updateData !== "object") return;
  const validProps = Object.keys(defaultData).filter((key) => key in updateData);
  for (let i = 0, len = validProps.length; i < len; i++) {
    const key = validProps[i];
    updateState(state, key, updateData[key]);
  }
  return state;
}

export function updateTargetState(targetState, payload, defaultData) {
  const updateData = isValidValue(payload) === true ? payload : defaultData;
  const newState = { ...targetState };
  updateStates(newState, updateData, defaultData);
  return Object.assign(targetState, newState);
}

const _mergeIgnoringUndefined = (defaultData, payload) => {
  const result = { ...defaultData }; // 기본 데이터를 먼저 복사
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value; // payload 값이 undefined가 아니면 덮어씌움
    }
  });
  return result;
};

export function mergeWithDefaults(targetState, payload, defaultData) {
  const updateData = _mergeIgnoringUndefined(defaultData, payload);
  const newState = { ...targetState };
  updateStates(newState, updateData, defaultData);
  return Object.assign(targetState, newState);
}

export function bigintPow(base, exponent) {
  if (exponent === 0n) {
    return 1n; // 어떤 수의 0제곱도 1
  }

  let result = 1n;
  let positiveExponent = exponent < 0n ? -exponent : exponent;

  for (let i = 0n; i < positiveExponent; i++) {
    result *= base;
  }

  // 지수가 음수면 역수를 계산
  return exponent < 0n ? 1n / result : result;
}

const _getDecimalSeparator = () => (1.1).toLocaleString().replace(/\d/g, "")[0];
/**
 *  @typedef {object} RemoveTrailingOption
 *  @property {string} [decimalSeparator] - 소숫점 포맷( ex: . 또는 , )
 *  @property {boolean} [isRemoveTrailingZeros] - 소수부 값의 뒤쪽에 0이 있는 경우 제거할지
 */
/**
 *  0.0000 등 소수부의 불필요한 0 값 제거
 *  @param {string} value
 *  @param {boolean|RemoveTrailingOption} [option]
 *  @param {string} [option.decimalSeparator="."]
 *  @param {boolean} [option.isRemoveTrailingZeros=false]
 *  @return {string}
 *  @private
 */
const _removeTrailingZeros = (value, option = {}) => {
  if (typeof option === "boolean" && option === false) {
    return value;
  }
  const { decimalSeparator = ".", isRemoveTrailingZeros = false } = option;
  // 소숫점이 있는지 확인
  if (value.includes(decimalSeparator) === false) {
    // 소수점이 없으면 원래 문자열 반환
    return value;
  }
  // 소숫점 이후 부분만 분리하여 0으로만 구성되어 있는지 확인
  const [integerPart, decimalPart] = value.split(decimalSeparator);
  if (!decimalPart) {
    // 잘못된 포맷
    return "";
  }
  if (decimalPart === "0" || /^0+$/.test(decimalPart) === true) {
    return integerPart; // 소수부가 0이면 정수부만 반환
  }
  /**
   * if isRemoveTrailingZeros === true: 소수부가 존재하면서 뒤쪽에 0이 있는 경우 제거
   * else 그대로 반환
   */
  return isRemoveTrailingZeros ? `${integerPart}.${decimalPart.replace(/0+$/, "")}` : value;
};

/**
 *  0. value * multiplier => 1000.000100 * 1.001321000
 *  1. 소숫점 아래 무의미한 0 제거 => 1000.0001 * 1.001321
 *  2. 둘 중 소숫점 아래의 자릿수가 가장 큰 값 기준으로 subMultiplier를 정함. => 1000.0001: 4 , 1.001321: 6 => subMultiplier = 6
 *  3. 소숫점을 제거하고 subMultiplier 와 차이 만큼 오른쪽에 0을 붙여준다. => 1000.0001 => 10000001[00] , 1001321
 *  4. multiplyBigInt 를 실행 => result =  BigInt( "1000000100" ) * BigInt( "1001321" )  => 1001321100132100
 *  5. 10 ** (subMultiplier) 만큼  divideBigInt 를 실행 => divideBigInt( BigInt( result ), BigInt( 10 ** subMultiplier ), option )
 *  => 1001321100132100 / 1000000 => 1001321100.1321 또는 1001321100.132100
 *  @param {string|bigint} value
 *  @param {string|bigint} multiplier
 *  @param {DivideBigIntOption} [option]
 *  @param {number} [option.fractionDigits=4]
 *  @return {string}
 */
export function multiplyValue(value, multiplier, option = {}) {
  // 1. 소숫점 아래 무의미한 0 제거
  const rmTrailingZerosValue = _removeTrailingZeros(value.toString(), {
    isRemoveTrailingZeros: true,
  });
  const rmTrailingZerosMultiplier = _removeTrailingZeros(multiplier.toString(), {
    isRemoveTrailingZeros: true,
  });
  // 2. 둘 중 소숫점 아래의 자릿수가 가장 큰 값 기준으로 승수를 정함.
  const valueDecimalLen = (rmTrailingZerosValue.split(".")[1] || "").length;
  const multiplierDecimalLen = (rmTrailingZerosMultiplier.split(".")[1] || "").length;

  const subMultiplier = Math.max(valueDecimalLen, multiplierDecimalLen);
  // 3. 소숫점을 제거하고
  const rmDecimalValue = rmTrailingZerosValue.replace(".", "");
  const rmDecimalMultiplier = rmTrailingZerosMultiplier.replace(".", "");

  // 4. 자릿수를 맞춰 BigInt로 변환 (padEnd 대신 10의 거듭제곱 사용)
  const adjustedValue =
    BigInt(rmDecimalValue) * bigintPow(10n, BigInt(subMultiplier - valueDecimalLen));
  const adjustedMultiplier =
    BigInt(rmDecimalMultiplier) * bigintPow(10n, BigInt(subMultiplier - multiplierDecimalLen));

  // 5. 10 ** (subMultiplier) 만큼  divideBigInt 를 실행
  const { fractionDigits = 4, removeOption } = option;
  return divideBigInt(
    adjustedValue * adjustedMultiplier,
    bigintPow(10n, BigInt(subMultiplier * 2)),
    { fractionDigits, removeOption }
  );
}

/**
 *  문자열을 BigInt로 변환하고 소수점 자릿수를 반환
 *  @param {string} value - 소수점이 포함된 숫자 문자열
 *  @return {object} - { bigIntValue: BigInt, decimalPlaces: number }
 *  bigIntValue: 소수점 제거 후의 BigInt 값
 *  decimalPlaces: 소수점 이하 자릿수
 */
const _stringToBigIntWithDecimal = (value) => {
  if (value.includes(".")) {
    const rmTrailingZerosValue = _removeTrailingZeros(value, { isRemoveTrailingZeros: true });
    const [integerPart, decimalPart] = rmTrailingZerosValue.split(".");
    const combinedValue = `${integerPart}${decimalPart}`; // 소수점을 제거한 값
    const decimalPlaces = decimalPart.length; // 소수점 이하 자릿수
    return { bigIntValue: BigInt(combinedValue), decimalPlaces };
  }
  return { bigIntValue: BigInt(value), decimalPlaces: 0 };
};

/**
 *  @typedef {object} DivideBigIntOption
 *  @property {number} [fractionDigits]
 *  @property {RemoveTrailingOption} [removeOption]
 */
/**
 *  bigint의 소수점 계산
 *  @param {string|bigint} value
 *  @param {string|bigint} divisor
 *  @param {DivideBigIntOption} [option]
 *  @param {number} [option.fractionDigits=4]
 *  @return {string}
 */
export function divideBigInt(value, divisor, option = {}) {
  console.log("value, divisor, option :>> ", value, divisor, option);
  // 문자열이 입력된 경우 BigInt로 변환
  let bigIntValue, bigIntDivisor;
  let valueDecimalPlaces = 0,
    divisorDecimalPlaces = 0;

  // 문자열인 경우 소수점 처리
  if (typeof value === "string") {
    const valueResult = _stringToBigIntWithDecimal(value);
    bigIntValue = valueResult.bigIntValue;
    valueDecimalPlaces = valueResult.decimalPlaces;
  } else {
    bigIntValue = BigInt(value);
  }

  if (typeof divisor === "string") {
    const divisorResult = _stringToBigIntWithDecimal(divisor);
    bigIntDivisor = divisorResult.bigIntValue;
    divisorDecimalPlaces = divisorResult.decimalPlaces;
  } else {
    bigIntDivisor = BigInt(divisor);
  }
  if (bigIntValue === 0n) {
    return "0";
  }
  if (bigIntDivisor === 0n) {
    return "Division by zero error";
  }
  const { fractionDigits = 4, removeOption } = option;
  // 소수점 이하 자릿수 차이를 계산하고 BigInt 승수 적용
  const totalDecimalPlaces = valueDecimalPlaces - divisorDecimalPlaces;

  // 자릿수 차이에 따라 10의 거듭제곱 적용
  if (totalDecimalPlaces > 0) {
    bigIntDivisor *= bigintPow(10n, BigInt(totalDecimalPlaces));
  } else if (totalDecimalPlaces < 0) {
    bigIntValue *= bigintPow(10n, BigInt(Math.abs(totalDecimalPlaces)));
  }

  // BigInt로 나눗셈 처리
  const raw = (bigIntValue * BigInt(10 ** fractionDigits)) / bigIntDivisor;

  // BigInt를 문자열로 변환하고 소수점 추가
  let parsedString = raw.toString();
  parsedString = parsedString.padStart(fractionDigits + 1, "0");
  parsedString = `${parsedString.slice(0, -fractionDigits)}.${parsedString.slice(-fractionDigits)}`;

  // 필요 시 소수점 뒤 0 제거

  return !removeOption ? parsedString : _removeTrailingZeros(parsedString, removeOption);
}
/**
 *  bigint의 소수점 계산 반올림
 *  @param {string|bigint} value
 *  @param {string|bigint} divisor
 *  @param {DivideBigIntOption} [option]
 *  @param {number} [option.fractionDigits=4]
 *  @return {string}
 */
export function roundBigInt(value, divisor, option = {}) {
  if (value === 0n) {
    return "0";
  }
  if (divisor === 0n) {
    return "Division by zero error";
  }
  const { fractionDigits = 4, removeOption } = option;
  const parsedString = divideBigInt(value, divisor, { fractionDigits: fractionDigits + 1 });
  // 문자열을 숫자로 변환하여 반올림 후 다시 문자열로
  const res = Number(parsedString).toFixed(fractionDigits);
  return !removeOption ? res : _removeTrailingZeros(res, removeOption);
}
/**
 *  bigint의 소수점 계산 내림
 *  @param {string|bigint} value
 *  @param {string|bigint} divisor
 *  @param {DivideBigIntOption} [option]
 *  @param {number} [option.fractionDigits=4]
 *  @return {string}
 */
export function floorBigInt(value, divisor, option = {}) {
  // 문자열이 입력된 경우 BigInt로 변환
  let bigIntValue, bigIntDivisor;
  let valueDecimalPlaces = 0,
    divisorDecimalPlaces = 0;

  // 문자열인 경우 소수점 처리
  if (typeof value === "string") {
    const valueResult = _stringToBigIntWithDecimal(value);
    bigIntValue = valueResult.bigIntValue;
    valueDecimalPlaces = valueResult.decimalPlaces;
  } else {
    bigIntValue = BigInt(value);
  }

  if (typeof divisor === "string") {
    const divisorResult = _stringToBigIntWithDecimal(divisor);
    bigIntDivisor = divisorResult.bigIntValue;
    divisorDecimalPlaces = divisorResult.decimalPlaces;
  } else {
    bigIntDivisor = BigInt(divisor);
  }

  if (bigIntValue === 0n) {
    return "0";
  }
  if (bigIntDivisor === 0n) {
    return "Division by zero error";
  }
  const { fractionDigits = 4, removeOption } = option;
  const totalDecimalPlaces = valueDecimalPlaces - divisorDecimalPlaces;
  const multiplier = bigintPow(10n, BigInt(Math.abs(totalDecimalPlaces) + fractionDigits + 1));
  // 자릿수 차이에 맞춰 BigInt로 변환 후 계산
  if (totalDecimalPlaces > 0) {
    bigIntDivisor *= multiplier; // 분모에 승수 곱하기
  } else if (totalDecimalPlaces < 0) {
    bigIntValue *= multiplier; // 분자에 승수 곱하기
  }
  const raw = (bigIntValue * multiplier) / bigIntDivisor;
  const floored = raw / BigInt(10); // 내림 처리용: 1을 뺀 정수로 처리
  const res = (Number(floored) / 10 ** fractionDigits).toFixed(fractionDigits);
  return !removeOption ? res : _removeTrailingZeros(res, removeOption);
}
/**
 *  bigint의 소수점 계산 올림
 *  @param {string|bigint} value
 *  @param {string|bigint} divisor
 *  @param {DivideBigIntOption} [option]
 *  @param {number} [option.fractionDigits=4]
 *  @return {string}
 */
export function ceilBigInt(value, divisor, option = {}) {
  let bigIntValue, bigIntDivisor;
  let valueDecimalPlaces = 0,
    divisorDecimalPlaces = 0;

  // 문자열인 경우 소수점 처리
  if (typeof value === "string") {
    const valueResult = _stringToBigIntWithDecimal(value);
    bigIntValue = valueResult.bigIntValue;
    valueDecimalPlaces = valueResult.decimalPlaces;
  } else {
    bigIntValue = BigInt(value);
  }

  if (typeof divisor === "string") {
    const divisorResult = _stringToBigIntWithDecimal(divisor);
    bigIntDivisor = divisorResult.bigIntValue;
    divisorDecimalPlaces = divisorResult.decimalPlaces;
  } else {
    bigIntDivisor = BigInt(divisor);
  }

  if (bigIntValue === 0n) {
    return "0";
  }
  if (bigIntDivisor === 0n) {
    return "Division by zero error";
  }
  const { fractionDigits = 4, removeOption } = option;
  const totalDecimalPlaces = valueDecimalPlaces - divisorDecimalPlaces;
  const multiplier = bigintPow(10n, BigInt(Math.abs(totalDecimalPlaces) + fractionDigits + 1));
  // 자릿수 차이에 맞춰 BigInt로 변환 후 계산
  if (totalDecimalPlaces > 0) {
    bigIntDivisor *= multiplier; // 분모에 승수 곱하기
  } else if (totalDecimalPlaces < 0) {
    bigIntValue *= multiplier; // 분자에 승수 곱하기
  }
  const raw = (bigIntValue * multiplier) / bigIntDivisor;
  const ceiled = (raw + BigInt(9)) / BigInt(10); // 올림 처리용: 마지막 자리에 9를 더해 올림
  const res = (Number(ceiled) / 10 ** fractionDigits).toFixed(fractionDigits);
  return !removeOption ? res : _removeTrailingZeros(res, removeOption);
}
/**
 *  숫자형 문자열에 콤마를 붙임.<br>
 *  단, locale 마다 숫자 포맷이 다 다를 수 있음<br>
 *  ex1) 1000.123 (ko-KR) -> 1,000.123<br>
 *  ex2) 1000.123 (fr-FR) -> 1 000,123<br>
 *  @param {number|bigint|string} value
 *  @return {null|string}
 */
export function safeAddComma(value) {
  if (isValidValue(value) === false) {
    return null;
  }
  try {
    // 1. 숫자 타입인지 확인
    if (typeof value === "number" || typeof value === "bigint") {
      return value.toLocaleString(); // 세자리마다 ',' 찍기
    }
    // 2. 그 외 경우 처리
    // 2.1. 정수부와 소수부로 나누기
    const [integerPart, decimalPart] = value.toString().split(".");

    // 2.2. 정수부(BigInt로 처리) 콤마 붙이기
    const formattedInteger = BigInt(integerPart).toLocaleString();

    // 2.3. 소수부가 있는 경우 정수부와 소수부를 결합하여 반환
    if (decimalPart) {
      // 소수부가 실제 숫자인지 확인 (잘못된 형식인 경우 걸러냄)
      if (/^\d+$/.test(decimalPart) === false) {
        return null;
      }
      // 나라별로 소숫점 나타내는 방식이 다르므로
      return `${formattedInteger}${_getDecimalSeparator()}${decimalPart}`;
    }

    // 소수부가 없는 경우 정수부만 반환
    return formattedInteger;
  } catch (err) {
    // 변환 불가능할 경우 null 반환
    return null;
  }
}
export function compareFloatStrings(str1, str2) {
  const normalize = (str) => {
    const [integerPart, decimalPart] = str.split(".");
    const trimmedDecimal = decimalPart ? decimalPart.replace(/0+$/, "") : "";
    return { integerPart, trimmedDecimal };
  };

  const { integerPart: int1, trimmedDecimal: dec1 } = normalize(str1);
  const { integerPart: int2, trimmedDecimal: dec2 } = normalize(str2);

  // 1. 정수부를 BigInt로 비교
  const integerPart1 = BigInt(int1);
  const integerPart2 = BigInt(int2);
  if (integerPart1 > integerPart2) {
    return 1;
  }
  if (integerPart1 < integerPart2) {
    return -1;
  }

  // 2. 소수부가 있는 경우
  if (dec1 || dec2) {
    const maxLength = Math.max(dec1.length, dec2.length);

    // 소수부를 동일한 길이로 맞추기 위해 10^(소수부 자릿수)로 승수 계산
    const decimal1 = BigInt(dec1.padEnd(maxLength, "0") || "0");
    const decimal2 = BigInt(dec2.padEnd(maxLength, "0") || "0");

    if (decimal1 > decimal2) {
      return 1;
    }
    if (decimal1 < decimal2) {
      return -1;
    }
  }
  // 3. 소수부도 같으면 동일한 값
  return 0;
}

/**
 * @param {number|string} date - 시간값(long) 또는 포맷팅된 시간값(yyyy-MM-dd 등)
 * @param {string} [type] - 포매팅 타입. T: 시간 포함
 * @return {string} 포매팅된 시간 값 ex) 2024-02-19 02:58
 */
export function getDateFormat(date, type = "D") {
  let format;
  switch (type) {
    case "D":
      format = "YYYY-MM-DD";
      break;
    case "T":
      format = "YYYY-MM-DD HH:mm";
      break;
    case "S":
      format = "YYYY-MM-DD HH:mm:ss";
      break;
    case "ko":
      format = "YYYY년 MM월 DD일";
      break;
    case "en":
      format = "MMMM DD, YYYY";
      break;
    default:
      format = type;
      break;
  }
  let res = "";
  switch (typeof date) {
    case "number":
      if (!isNaN(date)) {
        res = dayjs(date, "X").format(format);
      }
      break;
    case "string":
      if (date.trim().length !== 0) {
        // "2022-11-14T07:37:24.914Z"
        res = dayjs(date).format(format);
      }
      break;
    default:
      break;
  }
  return res;
}


export function errorHandler(message, option = {}) {
  return new Promise((resolve) => {
    alert(message);
    resolve();
  })
}