/**  @namespace Task */
/**
 *   @typedef {object} Task.LockAction
 *   @property {boolean} [showErrorLog]
 *   @property {boolean} [showRejectedReason]
 *   @property {function(Error|unknown): void} [onError]
 *   @property {function(): void} [onReject]
 */
import {ResultWrapperFactory} from '@/utils/factory/ResultWrapperFactory.js';

/**
 *  동시에 동작하면 안 되는 비동기 동작이 있다면 lock 을 걸고 거절함는 메서드를 만듬
 *  @param {function(...params: *[]): Promise<Type.ResultWrapper<T>>} targetTask
 *  @param {import('vue').Ref<boolean>} lockRef - lock 걸기위한 반응형 상태
 *  @param {Task.LockAction} [option] - 제어 옵션들
 *  @return {function(...params: *[]): Promise<Type.ResultWrapper<T | { error: Error|unknown }>>}
 *  @template T
 *  @throws Error
 */
export function useConcurrentTasks(targetTask, lockRef, option = {}) {
  return async (...params) => {
    const taskOption = option || {};
    if (lockRef.value) {
      const { showRejectedReason = false, onReject } = taskOption;
      showRejectedReason && console.error("Another task is already running!");
      onReject?.();
      return ResultWrapperFactory.create();
    }
    lockRef.value = true;
    try {
      return await targetTask(...params);
    } catch (error) {
      const { showErrorLog = false, onError } = taskOption;
      showErrorLog && console.error(error);
      if (!onError) {
        throw error;
      }
      onError?.(error);
      return ResultWrapperFactory.create({ error });
    } finally {
      lockRef.value = false;
    }
  };
}