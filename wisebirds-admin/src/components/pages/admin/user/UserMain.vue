<script setup>
import {onMounted, reactive, ref, toRefs, watch} from 'vue';
import GridTable from '@/components/organisms/table/GridTable.vue';
import {getDateFormat} from '@/utils/functions/useJsUtils.js';
import {fetchClient} from '@/utils/http/fetchClient.js';
import {ResultWrapperFactory} from '@/utils/factory/ResultWrapperFactory.js';
import UserManageModal from '@/components/pages/admin/user/components/organisms/modal/UserManageModal.vue';
import {useGlobalModalStore} from '@/store/modules/useGlobalModalStore.js';
import {useConcurrentTasks} from '@/composables/useConcurrentTasks.js';

const tableConfigs = [
  // 아이디
  { title: '아이디', bind: 'id', align: 'left' },
  // 이름
  { title: '이름', bind: 'name', align: 'left' },
  // 마지막 로그인
  {
    title: '마지막 로그인',
    bind: 'last_login_at',
    align: 'right',
    format: (date) => getDateFormat(date, 'S')
  },
  // 수정
  { title: '수정', name: 'edit', align: 'center', useSlot: true },
];
const state = reactive({
  /** @type {User.Content[]} */
  list: [],
  /** @type {Type.PagingInfo} */
  pagingInfo: {
    page: 1,
    size: 25,
    totalElements: 0,
  },
});
const { list, pagingInfo } = toRefs(state);


const fetchUsers = () => {
  return fetchClient('/api/users', {
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
const fetchUsersConcurrent = useConcurrentTasks(fetchUsers, isLoading);

/**
 *  @typedef {{
 *    name: string,
 *    email: string,
 *    password: string,
 *    repeat_password: string
 *  }} SubmitUserReqBody
 */
/**
 *  @typedef {{ id: number, name: string }} PatchUserReqBody
 */

const userManageModalState = reactive({
  show: false,
  type: '',
  modelValue: /** @type {User.Content} */{},
})
const openCreateUserModal = () => {
  userManageModalState.show = true;
  userManageModalState.type = 'create';
};
const openEditUserModal = (rowIndex) => {
  userManageModalState.show = true;
  userManageModalState.type = 'edit';
  userManageModalState.modelValue = state.list[rowIndex];
};
const closeUserManageModal = () => {
  userManageModalState.show = false;
}


const { openLoadingSpinner, closeLoadingSpinner } = useGlobalModalStore();
const isSubmitting = ref(false);
watch(isSubmitting, (newVal) => newVal ? openLoadingSpinner() : closeLoadingSpinner());

/**
 *  유저 신규 등록
 *  @type {
 *    function(SubmitUserReqBody): Promise<Type.ResultWrapper<{ data: * }|{errors: {key?: string, message?: string}[]}>>
 *  }
 */
const submitUser = useConcurrentTasks(async (payload) => {
  return fetchClient('/api/users', { method: 'POST', body: payload }).then((res) => {
    console.log("res :>> ", res);
    if (res.result) {
      return ResultWrapperFactory.create({ result: true });
    }
    return ResultWrapperFactory.create();
  }).catch((err) => {
    console.log("err :>> ", err);
    return ResultWrapperFactory.create({ error: err });
  }).finally(fetchUsers);
}, isSubmitting);
/**
 *  유저 수정
 *  @type {
 *    function(SubmitUserReqBody): Promise<Type.ResultWrapper<{ data: * }|{errors: {key?: string, message?: string}[]}>>
 *  }
 */
const patchUser = useConcurrentTasks(async (payload) => {
  const { id, ...body } = payload;
  return fetchClient(`/api/campaigns/${id}`, { method: 'PATCH', body }).then((res) => {
    console.log("res :>> ", res);
    if (res.result) {
      return ResultWrapperFactory.create({ result: true });
    }
    return ResultWrapperFactory.create();
  }).catch((err) => {
    console.log("err :>> ", err);
    return ResultWrapperFactory.create({ error: err });
  }).finally(fetchUsers);
}, isSubmitting);
const onUserManageModalSubmit = async (payload) => {
  if (!['create', 'edit'].includes(userManageModalState.type)) {
    return;
  }
  return (
    userManageModalState.type === 'create'
      ? submitUser(payload)
      : patchUser(payload)
  );
}

onMounted(() => {
  fetchUsersConcurrent();
});
</script>
<template>
  <!-- 사용자 관리 -->
  <section class="card-container">
    <div class="title-container">
      <h1>사용자 관리</h1>
    </div>
    <div class="btn-container">
      <base-button
        class="add-user-btn"
        @click="openCreateUserModal()"
      >
        생성
      </base-button>
    </div>
    
    <grid-table
      :is-loading="isLoading"
      table-key-props="id"
      :table-configs="tableConfigs"
      :list="list"
      :paging-info="pagingInfo"
    >
      <template #edit="{ rowIndex, tableRow }">
        <base-button
          class="edit-user-btn"
          @click="openEditUserModal(rowIndex)"
        >
          수정
        </base-button>
      </template>
    </grid-table>
    
    <user-manage-modal
      v-bind="userManageModalState"
      @close="closeUserManageModal"
      @submit="onUserManageModalSubmit"
    />
  </section>
</template>
<style scoped>

</style>