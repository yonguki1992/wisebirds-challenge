<script setup>
import {nextTick, onMounted, reactive, ref, toRefs, watch} from 'vue';
import {fetchClient} from '@/utils/http/fetchClient.js';
import {
  errorHandler,
  isValidValue,
  safeAddComma,
  useValidatePayload,
} from '@/utils/functions/useJsUtils.js';
import {ResultWrapperFactory} from '@/utils/factory/ResultWrapperFactory.js';
import GridTable from '@/components/organisms/table/GridTable.vue';
import {CAMPAIGNS_OBJECTIVE_CODE, CAMPAIGNS_OBJECTIVE_NAME} from '@/constants/campaignsConstants.js';
import {useAuthStore} from '@/store/modules/useAuthStore.js';
import {storeToRefs} from 'pinia';
import {PAGE_PERMISSION_DENIED, PERMISSIONS_CODE, SESSION_OVER} from '@/constants/commonConstants.js';
import {useRouter} from 'vue-router';
import {useGlobalModalStore} from '@/store/modules/useGlobalModalStore.js';
import {useOptionByValue} from '@/composables/useOptionByValue.js';
import {useConcurrentTasks} from '@/composables/useConcurrentTasks.js';

const router = useRouter();

const authStore = useAuthStore();
const { userAuth, isAuthenticated } = storeToRefs(authStore);

const state = reactive({
  /** @type {Campaign.Content[]} */
  list: [],
  /** @type {Type.PagingInfo} */
  pagingInfo: {
    page: 1,
    size: 25,
    totalElements: 0,
  },
});
const { list, pagingInfo } = toRefs(state);
/**
 *  @type {function(v: string): Type.ItemOption<string, Type.EmptyObject>}
 */
const getCampaignObjectiveByValue = useOptionByValue(
  Object.keys(CAMPAIGNS_OBJECTIVE_CODE).map((key) => {
    return {
      name: CAMPAIGNS_OBJECTIVE_NAME[key],
      value: CAMPAIGNS_OBJECTIVE_CODE[key],
    };
  }), {
    name: "",
    value: "",
  }
);
const tableConfigs = [
  { title: '캠페인 ID', bind: 'id', colHide: true },
  { title: '상태', name: 'enabled', bind: 'enabled', align: 'center', useSlot: true },
  { title: '캠페인명', bind: 'name', align: 'left' },
  {
    title: '캠페인 목적',
    bind: 'campaign_objective',
    align: 'left',
    format: (v) => getCampaignObjectiveByValue(v).name,
  },
  {
    title: '노출수',
    bind: 'impressions',
    align: 'right',
    format: (v) => safeAddComma(v) || 0,
  },
  {
    title: '클릭수',
    bind: 'clicks',
    align: 'right',
    format: (v) => safeAddComma(v) || 0,
  },
  {
    title: 'CTR',
    bind: 'ctr',
    align: 'right',
    format: (v) => {
      const value = isValidValue(v) ? v : 0;
      return `${Math.round(Number(value) * 100)}%`;
    },
  },
  { title: '동영상조회수', bind: 'video_views', align: 'right' },
  {
    title: 'VTR',
    bind: 'vtr',
    align: 'right',
    format: (v) => {
      const value = isValidValue(v) ? v : 0;
      return `${Math.round(Number(value) * 100)}%`;
    },
  },
];

const fetchCampaigns = () => {
  return fetchClient('/api/campaigns', {
    method: 'GET',
    params: { page: state.pagingInfo.page, size: state.pagingInfo.size },
  }).then((res) => {
    const {content, total_elements} = res;
    state.list = content;
    state.pagingInfo = {
      ...state.pagingInfo,
      totalElements: total_elements,
    };
    return ResultWrapperFactory.create({ result: true, data: res });
  });
};
const isLoading = ref(false);
const fetchCampaignsConcurrent = useConcurrentTasks(fetchCampaigns, isLoading);
const onPageChange = (pageNum) => {
  state.pagingInfo = {
    ...state.pagingInfo,
    page: pageNum,
  };
  return fetchCampaignsConcurrent();
}

const onEnabledChange = (event, rowIndex) => {
  const checked = event.target.checked;
  patchCampaign({
    rowIndex,
    enabled: checked
  }).then(async (res) => {
    if (res.result) {
      return;
    }
    await nextTick();
    // 체크박스 값 원래대로 돌리기
    state.list = state.list.map((item, index) => {
      if (rowIndex !== index) {
        return item;
      }
      return (/** @type {Campaign.Content} */{ ...item, enabled: !checked });
    });
    event.target.checked = !checked;
  })
  .finally(fetchCampaigns);
};
const { openLoadingSpinner, closeLoadingSpinner } = useGlobalModalStore();
const isSubmitting = ref(false);
watch(isSubmitting, (newVal) => newVal ? openLoadingSpinner() : closeLoadingSpinner());

const patchCampaign = useConcurrentTasks(async ({ rowIndex, enabled }) => {
  const { id } = state.list[rowIndex];
  // 0. 사용자 인증 풀렸는지.
  if (!isAuthenticated.value) {
    await errorHandler(SESSION_OVER).then(() => router.push('/'));
    authStore.fetchUserAuth();
    return ResultWrapperFactory.create();
  }
  // 1. 해당 페이지 권한 있는지.
  if (!authStore.hasRoutePermission()) {
    await errorHandler(PAGE_PERMISSION_DENIED).then(() => router.push('/'));
    return ResultWrapperFactory.create();
  }
  // 2. 파라미터 값은 유효한지.
  const validateRes = useValidatePayload({ id, enabled });
  if (!validateRes.result) {
    await errorHandler(validateRes.errors[0].message);
    return validateRes;
  }
  
  return fetchClient(`/api/campaigns/${id}`, {
    method: 'PATCH',
    body: { enabled },
  }).then((res) => {
    if (res.result) {
      return ResultWrapperFactory.create({ result: true });
    }
    return ResultWrapperFactory.create();
  }).catch((err) => {
    console.log("err :>> ", err);
    // 에러메시지
    return ResultWrapperFactory.create({ error: err });
  });
}, isSubmitting);

onMounted(() => {
  fetchCampaignsConcurrent();
});
</script>
<template>
  <section class="card-container">
    <div class="title-container">
      <h1>캠페인 관리</h1>
    </div>
    
    <grid-table
      :isLoading="isLoading"
      table-key-props="id"
      :table-configs="tableConfigs"
      :list="list"
      :paging-info="pagingInfo"
      @page-change="onPageChange"
    >
      <template #enabled="{ tableRow, rowIndex }">
        <base-toggle-switch
          :disabled="userAuth.permission === PERMISSIONS_CODE.VIEWER"
          :checked="tableRow.enabled"
          @change="onEnabledChange($event, rowIndex)"
        />
      </template>
    </grid-table>
  </section>
</template>
<style scoped>

</style>