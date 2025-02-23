import {isValidValue} from '@/utils/functions/useJsUtils.js';
import {toValue} from 'vue';

/** option value 값으로 ItemOption을 가져올 수 있음.<p>
 *  ItemOption을 찾을 수 없으면 기본값 또는 빈 객체를 반환함.
 *  @param  {Type.ItemOption<V, T>[]} options       - 옵션 배열
 *  @param  {V}  targetValue   - 찾을 옵션 값
 *  @param  {
 *      Type.ItemOption<V, T>|
 *      Type.EmptyObject
 *  } [defaultValue={}] - 기본 값(optional)
 *  @return {
 *      Type.ItemOption<V, T>|
 *      Type.EmptyObject
 *  } - 찾은 option<p>
 *  못찾았으면: 빈 obj 또는 defaultValue 반환
 *  @template V
 *  @template T
 */
const getOptionByValue = (options, targetValue, defaultValue = {}) => {
  if (!isValidValue(targetValue) || !isValidValue(options)) return {};
  return options.find(({ value }) => value === targetValue) || defaultValue;
};
/**
 *  optionByValue 생성자
 *  @param {
 *    import('vue').MaybeRefOrGetter<Type.ItemOption<V, T>[]>|
 *    Type.ItemOption<V, T>[]
 *  } options
 *  @param {
 *    import('vue').MaybeRefOrGetter<Type.ItemOption<V, T>>|
 *    Type.EmptyObject
 *  } [defaultValue={}]
 *  @return {function(import('vue').Ref<V>|V): Type.ItemOption<V, T>|Type.EmptyObject}
 *  @template V
 *  @template T
 */
export function useOptionByValue(options, defaultValue = {}) {
  return (targetValue) =>
    getOptionByValue(toValue(options), toValue(targetValue), toValue(defaultValue));
}
