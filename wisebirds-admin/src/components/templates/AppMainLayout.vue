<script setup>
import GlobalNavBar from "@/components/organisms/navigation/GlobalNavBar.vue";
import ErrorHandleModal from '@/components/organisms/modal/ErrorHandleModal.vue';
import {useGlobalModalStore} from '@/store/modules/useGlobalModalStore.js';
import {storeToRefs} from 'pinia';
import BaseSpinner from '@/components/atoms/BaseSpinner.vue';
const errorModalStore = useGlobalModalStore();
const { errorModalProps, loadingSpinnerProps } = storeToRefs(errorModalStore);
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