<script setup>
import GlobalNavBar from "@/components/organisms/navigation/GlobalNavBar.vue";
import ErrorHandleModal from '@/components/organisms/modal/ErrorHandleModal.vue';
import {storeToRefs} from 'pinia';
import BaseSpinner from '@/components/atoms/BaseSpinner.vue';
import { useAuthStore } from "@/store/modules/useAuthStore.js";
import { useGlobalModalStore } from "@/store/modules/useGlobalModalStore.js";
import { onMounted } from "vue";
import { PERMISSIONS_CODE } from "@/constants/commonConstants.js";

const errorModalStore = useGlobalModalStore();
const { errorModalProps, loadingSpinnerProps } = storeToRefs(errorModalStore);

const authStore = useAuthStore();

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      await authStore.fetchUserAuth();
    }
  } catch (error) {
    console.error(error);
    authStore.setPermission(PERMISSIONS_CODE.VIEWER);
    errorModalStore.openErrorModal();
  }
});
</script>
<template>
  <global-nav-bar/>
  <transition name="fade" mode="out-in">
    <router-view/>
  </transition>
  <error-handle-modal
    v-bind="errorModalProps"
    @close="errorModalStore.closeErrorModal"
  />
  <base-spinner
    v-if="loadingSpinnerProps.show"
    v-bind="loadingSpinnerProps"
  />
</template>
<style scoped>
</style>