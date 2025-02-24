<script setup>
import {onMounted, reactive, ref, toRefs, watch} from 'vue';
import GridTable from '@/components/organisms/table/GridTable.vue';
import { getDateFormat, safeEncodeURIComponent } from '@/utils/functions/useJsUtils.js';
import UserManageModal from '@/components/pages/admin/user/components/organisms/modal/UserManageModal.vue';
import {useGlobalModalStore} from '@/store/modules/useGlobalModalStore.js';
import { useFetchClient } from "@/composables/useFetchClient.js";

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


// const fetchUsers = () => {
//   return useFetchClient('/api/users', {
//     method: 'GET',
//     params: { page: state.pagingInfo.page, size: state.pagingInfo.size },
//     immediate: true,
//     onResponse: ({ data }) => {
//       const {content, total_elements} = data.value;
//       state.list = content;
//       state.pagingInfo = {
//         ...state.pagingInfo,
//         totalElements: total_elements,
//       };
//     }
//   });
// }

const { execute: fetchUsers } = useFetchClient('/api/users', {
  method: 'GET',
  params: (() => ({ page: state.pagingInfo.page, size: state.pagingInfo.size })),
  onResponse: ({ data }) => {
    const {content, total_elements} = data.value;
    state.list = content;
    state.pagingInfo = {
      ...state.pagingInfo,
      totalElements: total_elements,
    };
  }
});

const isLoading = ref(false);
const fetchUsersWithLoading = () => {
  isLoading.value = true;
  return fetchUsers().finally(() => {
    isLoading.value = false;
  });
};
const onPageChange = (pageNum) => {
  state.pagingInfo = {
    ...state.pagingInfo,
    page: pageNum,
  };
  return fetchUsersWithLoading();
}
/**
 *  @typedef {{ userId: string, name: string, password: string, confirmPassword: string }} SubmitUserReqBody
 */
/**
 *  @typedef {Pick<SubmitUserReqBody, 'userId'|'name'>} PatchUserReqBody
 */

const userManageModalState = reactive({
  show: false,
  type: '',
  modelValue: /** @type {User.Content} */{},
})
const openCreateUserModal = () => {
  userManageModalState.type = 'create';
  userManageModalState.show = true;
};
const openEditUserModal = (rowIndex) => {
  userManageModalState.type = 'edit';
  userManageModalState.modelValue = state.list[rowIndex];
  userManageModalState.show = true;
};
const closeUserManageModal = () => {
  userManageModalState.show = false;
}


const { openLoadingSpinner, closeLoadingSpinner } = useGlobalModalStore();
const isSubmitting = ref(false);
watch(isSubmitting, (newVal) => newVal ? openLoadingSpinner() : closeLoadingSpinner());

/**
 *  유저 신규 등록
 *  @param {SubmitUserReqBody} payload
 */
const submitUser = async (payload) => {
  return useFetchClient('/api/users', {
    method: 'POST',
    body: payload,
    immediate: true,
    onPreFetch: () => isSubmitting.value = true,
    onFinally: () => {
      isSubmitting.value = false;
      fetchUsers();
    },
  });
  }
/**
 *  유저 수정
 *  @param {PatchUserReqBody} payload
 */
const patchUser = async (payload) => {
  const { userId: id, ...body } = payload;

  return useFetchClient(`/api/users/${safeEncodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
    immediate: true,
    onPreFetch: () => isSubmitting.value = true,
    onFinally: () => {
      isSubmitting.value = false;
      fetchUsers();
    }
  })
};

/**
 *  유저 수정/신규 등록
 *  @param {SubmitUserReqBody|PatchUserReqBody} payload
 */
const onUserManageModalSubmit = async (payload) => {
  if (!['create', 'edit'].includes(userManageModalState.type)) {
    return;
  }
  return (
    userManageModalState.type === 'create'
      ? submitUser(payload)
      : patchUser(payload)
  ).then(closeUserManageModal);
}

onMounted(() => {
  fetchUsersWithLoading();
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
      @page-change="onPageChange"
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
