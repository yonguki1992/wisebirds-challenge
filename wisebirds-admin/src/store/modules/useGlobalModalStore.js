import {defineStore} from 'pinia';
import {computed, reactive, ref} from 'vue';
import {COMMON_ERROR_MESSAGE} from '@/constants/commonConstants.js';

export const useGlobalModalStore = defineStore('global-modal', () => {
  
  const errorModalState = reactive({
    message: COMMON_ERROR_MESSAGE,
    show: false,
  });
  
  const errorModalProps = computed(() =>
    (/** @type {{ message: string, show: boolean }}*/{
      message: errorModalState.message,
      show: errorModalState.show,
    })
  );
  const openErrorModal = (message = COMMON_ERROR_MESSAGE) => {
    errorModalState.message = message;
    errorModalState.show = true;
  }
  
  const closeErrorModal = () => {
    // 초기화
    errorModalState.show = false;
    errorModalState.message = COMMON_ERROR_MESSAGE;
  }
  
  const loadingSpinnerState = reactive({
    show: false,
    type: 'jump',
    fixed: true,
    mask: true,
  });
  const loadingSpinnerProps = computed(() => ({
    show: loadingSpinnerState.show,
    type: loadingSpinnerState.type,
    fixed: loadingSpinnerState.fixed,
    mask: loadingSpinnerState.mask,
  }))
  const initSpinnerState = (option = {}) => {
    const {
      type = 'jump',
      fixed = true,
      mask = true,
    } = option;
    loadingSpinnerState.type = type;
    loadingSpinnerState.fixed = fixed;
    loadingSpinnerState.mask = mask;
  }
  const openLoadingSpinner = (option = {}) => {
    loadingSpinnerState.show = true;
    initSpinnerState(option);
  }
  const closeLoadingSpinner = () => {
    loadingSpinnerState.show = false;
    initSpinnerState();
  }
  
  return {
    errorModalProps,
    openErrorModal,
    closeErrorModal,
    
    loadingSpinnerProps,
    openLoadingSpinner,
    closeLoadingSpinner,
  };
})