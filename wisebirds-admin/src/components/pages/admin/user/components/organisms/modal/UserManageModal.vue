<script setup>
import {nextTick, reactive, ref, toRefs, watch} from 'vue';
import {errorHandler, isValidValue, useDebounceTask} from '@/utils/functions/useJsUtils.js';
import {
  USERS_ERROR_CONFIRM_PASSWORD_EMPTY_LABEL,
  USERS_ERROR_CONFIRM_PASSWORD_MISMATCH_LABEL,
  USERS_ERROR_EMAIL_ALREADY_EXISTS_LABEL,
  USERS_ERROR_EMAIL_EMPTY_LABEL,
  USERS_ERROR_EMAIL_INVALID_LABEL,
  USERS_ERROR_NAME_EMPTY_LABEL,
  USERS_ERROR_PASSWORD_EMPTY_LABEL,
  USERS_ERROR_PASSWORD_INVALID_LABEL,
  USERS_ERROR_PASSWORD_INVALID_PLACEHOLDER,
  USERS_VALID_PASSWORD_REGEX,
  USERS_VALID_EMAIL_REGEX,
  USERS_ERROR_NAME_INVALID_LABEL,
  USERS_VALID_EMAIL_LENGTH_REGEX, USERS_VALID_NAME_REGEX,
} from '@/constants/usersConstants.js';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/store/modules/useAuthStore.js';
import {storeToRefs} from 'pinia';
import {ResultWrapperFactory} from '@/utils/factory/ResultWrapperFactory.js';
import {PAGE_PERMISSION_DENIED, SESSION_OVER} from '@/constants/commonConstants.js';
import { useFetchClient } from "@/composables/useFetchClient.js";

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const props = defineProps({
  show: { type: Boolean, required: false, default: false },
  type: { type: String, required: false, default: 'create' },
  modelValue: { type: Object, required: false, default: () => ({}) },
});
const { show, type, modelValue } = toRefs(props);
watch(show, () => {
  form.value = getDefaultForm();
  errors.value = getDefaultForm();
})
const emits = defineEmits(['close', 'submit']);

const labelText = {
  create: { title: '생성', btnTxt: '생성' },
  edit:  { title: '수정', btnTxt: '저장' },
};
const getLabelText = () => {
  const res = labelText[type.value];
  if (!isValidValue(res)) {
    return {};
  }
  return res;
}

const formRefs = reactive({
  userIdRef: null,
  passwordRef: null,
  confirmPasswordRef: null,
  nameRef: null,
});
const onInputReady = (elRef, field) => {
  if (!isValidValue(field)) {
    return;
  }
  formRefs[`${field}Ref`] = elRef;
};

/**
 *
 *  @param {User.Content} [payload={}]
 *  @return {{ userId: string, name: string, password: string, confirmPassword: string }}
 */
const getDefaultForm = (payload = /** @type {User.Content} */{}) => {
  const { email: userId = '', name = '' } = payload;
  return {
    userId,
    name,
    password: '',
    confirmPassword: '',
  }
};
const form = ref(getDefaultForm());
const errors = ref(getDefaultForm());

watch(modelValue, (newValue) => {
  form.value = getDefaultForm(newValue);
});

const onInputAndValidateEmail = (event) => {
  checkExistsEmail.cancel();
  const targetValue = event.target.value;
  if (targetValue === form.value.userId) {
    return;
  }
  form.value.userId = targetValue;
  checkExistsEmail(targetValue);
};

const checkExistsEmail = useDebounceTask((email) => {
  if (!isValidValue(email)) {
    errors.value.userId = '';
    return;
  }
  if (!new RegExp(USERS_VALID_EMAIL_REGEX).test(email)) {
    errors.value.userId = USERS_ERROR_EMAIL_INVALID_LABEL;
    return;
  }
  return useFetchClient(`/api/users/${email}/exists`, {
    method: 'GET',
    immediate: true,
    onResponse: ({ data }) => {
      if (!data.value.result) {
        errors.value.userId = '';
        return;
      }
      errors.value.userId = USERS_ERROR_EMAIL_ALREADY_EXISTS_LABEL;
    },
    onError: () => {
      nextTick(() => {
        // 포커스를 쥐고 있을테니 풀어줌
        formRefs.userIdRef.blur();
      });
    }
  });
}, 300);


const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const validateForm = () => {
  errors.value = getDefaultForm();
  if (!['create', 'edit'].includes(type.value)) {
    return ResultWrapperFactory.create();
  }
  
  if (type.value === 'create') {
    if (!isValidValue(form.value.userId.trim())) {
      errors.value.userId = USERS_ERROR_EMAIL_EMPTY_LABEL;
    } else if (
      ![
        new RegExp(USERS_VALID_EMAIL_LENGTH_REGEX),
        new RegExp(USERS_VALID_EMAIL_REGEX)
      ].every((regex) => regex.test(form.value.userId))
    ) {
      errors.value.userId = USERS_ERROR_EMAIL_INVALID_LABEL;
    }
    if (!isValidValue(form.value.password.trim())) {
      errors.value.password = USERS_ERROR_PASSWORD_EMPTY_LABEL;
    } else if (!new RegExp(USERS_VALID_PASSWORD_REGEX).test(form.value.password)) {
      errors.value.password = USERS_ERROR_PASSWORD_INVALID_LABEL;
    }
    
    if (!isValidValue(form.value.confirmPassword.trim())) {
      errors.value.confirmPassword = USERS_ERROR_CONFIRM_PASSWORD_EMPTY_LABEL;
    } else if (form.value.confirmPassword !== form.value.password) {
      errors.value.confirmPassword = USERS_ERROR_CONFIRM_PASSWORD_MISMATCH_LABEL;
    }
  }
  
  if (!isValidValue(form.value.name.trim())) {
    errors.value.name = USERS_ERROR_NAME_EMPTY_LABEL;
  } else if (!new RegExp(USERS_VALID_NAME_REGEX.pattern, USERS_VALID_NAME_REGEX.flags).test(form.value.name)) {
    errors.value.name = USERS_ERROR_NAME_INVALID_LABEL;
  }
  
  return ResultWrapperFactory.create({
    result: Object.values(errors.value).every((error) => error === ''),
  });
};

/**
 *
 *  @returns {Type.ResultWrapper<{errors: {key?: string, message?: string}[]}>}
 */
const validatePermissions = () => {
  // 0. 사용자 인증 풀렸는지.
  if (!isAuthenticated.value) {
    errorHandler(SESSION_OVER).then(() => router.push('/'));
    authStore.fetchUserAuth();
    return ResultWrapperFactory.create();
  }
  // 1. 해당 페이지 권한 있는지.
  if (!authStore.hasRoutePermission()) {
    errorHandler(PAGE_PERMISSION_DENIED).then(() => router.push('/'));
    return ResultWrapperFactory.create();
  }
  return ResultWrapperFactory.create({ result: true });
};

const onSubmit = () => {
  if (!validatePermissions().result) {
    return;
  }
  if (!validateForm().result) {
    return;
  }
  emits('submit', { ...form.value });
};

const togglePasswordVisibility = (field) => {
  if (![ 'password', 'confirmPassword' ].includes(field)) {
    return;
  }
  if (field === 'password') {
    isPasswordVisible.value = !isPasswordVisible.value;
    return;
  }
  isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
};
const closeModal = () => {
  emits('close')
}
</script>

<template>
  <div
    v-if="show"
    class="modal-mask"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2>사용자 {{ getLabelText().title }}</h2>
        <base-button
          class="close-btn"
          @click="closeModal"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </base-button>
      </div>
      
      <div class="modal-body">
        <!-- 아이디 입력 -->
        <div class="form-group">
          <label for="userId">
            아이디
            <span v-if="type === 'create'" class="required">*</span>
          </label>
          <template v-if="type === 'create'">
            <base-input
              id="userId"
              type="email"
              placeholder="아이디(이메일)"
              autocomplete="off"
              :value="form.userId"
              @input="onInputAndValidateEmail"
              @ready="onInputReady($event, 'userId')"
            />
            <div class="error-tooltip">
              <p
                v-if="errors.userId"
                class="error-message"
              >
                {{ errors.userId }}
              </p>
            </div>
          </template>
          <template v-else>
            {{ form.userId }}
          </template>
        </div>
        
        <template v-if="type === 'create'">
          <!-- 비밀번호 입력 -->
          <div class="form-group">
            <label for="password">
              비밀번호
              <span class="required">*</span>
            </label>
            <div class="password-container">
              <base-input
                :type="isPasswordVisible ? 'text' : 'password'"
                id="password"
                autocomplete="off"
                v-model="form.password"
                :placeholder="USERS_ERROR_PASSWORD_INVALID_PLACEHOLDER"
                @ready="onInputReady($event, 'password')"
              />
              <base-button
                type="button"
                class="toggle-btn"
                @click="togglePasswordVisibility('password')"
              >
                <font-awesome-icon :icon="['fas', `eye${isPasswordVisible ? '' : '-slash'}`]" />
              </base-button>
            </div>
            <div class="error-tooltip">
              <p
                v-if="errors.password"
                class="error-message"
              >
                {{ errors.password }}
              </p>
            </div>
          </div>
          
          <!-- 비밀번호 확인 -->
          <div class="form-group">
            <label for="confirmPassword">
              비밀번호 확인
              <span class="required">*</span>
            </label>
            <div class="password-container">
              <base-input
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                id="confirmPassword"
                autocomplete="off"
                v-model="form.confirmPassword"
                placeholder="비밀번호 확인"
                @ready="onInputReady($event, 'confirmPassword')"
              />
              <button type="button" class="toggle-btn" @click="togglePasswordVisibility('confirmPassword')">
                <font-awesome-icon :icon="['fas', `eye${isConfirmPasswordVisible ? '' : '-slash'}`]" />
              </button>
            </div>
            <div class="error-tooltip">
              <p
                v-if="errors.confirmPassword"
                class="error-message"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>
        </template>

        
        <!-- 이름 입력 -->
        <div class="form-group">
          <label for="name">
            이름
            <span class="required">*</span>
          </label>
          <base-input
            id="name"
            type="text"
            autocomplete="off"
            v-model="form.name"
            placeholder="이름"
            @ready="onInputReady($event, 'name')"
          />
          <div class="error-tooltip">
            <p
              v-if="errors.name"
              class="error-message"
            >
              {{ errors.name }}
            </p>
          </div>
        </div>
        
        <!-- 버튼 -->
        <div class="modal-footer">
          <base-button
            type="button"
            class="cancel-btn"
            @click="closeModal"
          >
            취소
          </base-button>
          <base-button
            type="submit"
            class="submit-btn"
            @click="onSubmit"
          >
            {{ getLabelText().btnTxt }}
          </base-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 입력 필드와 레이블 간격 조정 */
.form-group {
  margin-bottom: 20px; /* 간격 조정 */
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 비밀번호 입력 필드 내 아이콘 정렬 */
.password-container {
  display: flex;
  align-items: center;
  position: relative;
}

.password-container input {
  flex: 1;
  padding-right: 40px; /* 오른쪽 여백 추가 */
}

/* 비밀번호 토글 버튼 아이콘 위치 조정 */
.toggle-btn {
  position: absolute;
  right: 10px;
  padding: 5px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-left: -30px;
}

/* 모달 마스크 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}


/* 모달 컨테이너 */
.modal-container {
  position: fixed;
  top: 15%; /* 기존보다 위쪽으로 배치 */
  left: 50%;
  transform: translate(-50%, -15%); /* 중앙 정렬 유지 */
  width: 420px;
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* 폼 스타일 */
.modal-body {
  padding: 20px 0;
}


label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}


/* 말풍선 형태의 오류 메시지 */
.error-tooltip {
  position: absolute;
  bottom: -32px;
  left: 0;
  max-width: 90%;
  display: inline-block;
}

/* 오류 메시지 스타일 */
.error-message {
  border: 1px solid #aaaaaa;
  background: #ffffff;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #d9534f;
  line-height: 1.4;
  display: inline-block;
  word-break: keep-all;
  position: relative;
  z-index: 100;
}

/* 말풍선 꼬리 추가 */
.error-message::after {
  content: "";
  position: absolute;
  top: -6px;
  left: 16px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #aaaaaa;
}


/* 필수 입력 표시 (*) */
.required {
  color: #f44336;
  margin-left: 4px;
}

/* 푸터 */
.modal-footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}

.cancel-btn, .submit-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn {
  background: #878787;
  margin-right: 10px;
}

.submit-btn {
  background: #007bff;
  color: white;
}
</style>
