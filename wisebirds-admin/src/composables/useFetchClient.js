import { computed, ref, toValue } from 'vue';
import { useConcurrentTasks } from '@/composables/useConcurrentTasks.js';
import { ResultWrapperFactory } from '@/utils/factory/ResultWrapperFactory.js';
import { requestInterceptor, responseInterceptor } from '@/utils/http/fetchInterceptor.js';
import { isValidValue } from '@/utils/functions/useJsUtils.js';
import { useGlobalModalStore } from '@/store/modules/useGlobalModalStore.js';

export function useFetchClient(targetUrl, options = {}) {
  const { openErrorModal } = useGlobalModalStore();

  const data = ref(null);
  const error = ref(null);
  const response = ref(null);
  const statusCode = ref(null);

  const {
    onPreFetch,
    onResponse,
    onError,
    onFinally,
    immediate,
    ...otherOption
  } = options;

  const isFinished = ref(false);
  const isFetching = ref(false);

  const config = computed(() => {
    const { params, body, ...requestInitOptions } = otherOption;
    const newConfig = requestInitOptions;
    if (isValidValue(params)) {
      newConfig.params = toValue(params);
    }
    if (isValidValue(body)) {
      newConfig.body = toValue(body);
    }
    return requestInterceptor(toValue(targetUrl), newConfig);
  });

  const execute = useConcurrentTasks(
    () => {
      isFinished.value = false;
      onPreFetch && onPreFetch();

      if (!isValidValue(config.value) || !isValidValue(config.value.url)) {
        return ResultWrapperFactory.create();
      }
      const { url, ...otherConfigs } = config.value;

      return fetch(url, otherConfigs)
        .then((res) => {
          response.value = res;
          statusCode.value = res.statusCode
          return responseInterceptor(res);
        })
        .then((resData) => {
          data.value = resData;
          onResponse && onResponse({
            data,
            response,
            statusCode,
          });
          return ResultWrapperFactory.create({ result: true, data });
        })
        .catch((err) => {
          error.value = err;
          openErrorModal();
          onError && onError({
            error,
            response,
            statusCode,
          });
          return ResultWrapperFactory.create({ result: false, error });
        })
        .finally(() => {
          onFinally && onFinally({
            response,
            statusCode,
            error,
            data,
          });
          isFinished.value = true;
        });

    },
    isFetching
  );

  if (immediate) {
    return execute();
  }

  return {
    data,
    error,
    response,
    statusCode,
    isFinished,
    isFetching,
    execute,
  };
}