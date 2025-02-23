<script setup>
import DropDownMenu from '@/components/molecules/DropDownMenu.vue';
import PopoverProfile from '@/components/molecules/PopoverProfile.vue';
import {deepFreeze, errorHandler} from '@/utils/functions/useJsUtils.js';
import {PAGE_PERMISSION_DENIED, PERMISSIONS_CODE, PERMISSIONS_NAME} from '@/constants/commonConstants.js';
import {storeToRefs} from 'pinia';
import {useAuthStore} from '@/store/modules/useAuthStore.js';
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const { userAuth, permission, isAuthenticated } = storeToRefs(authStore);

const roleOptions = deepFreeze(
  /** @type {Type.ItemOption<Type.Permission, Type.EmptyObject>[]} */
  Object
    .keys(PERMISSIONS_CODE)
    .map((key) => ({ value: PERMISSIONS_CODE[key], name: PERMISSIONS_NAME[key] }))
);
const routes = ref(router.getRoutes().filter((route) => route.path !== '/'));

watch(permission, () => {
  if (!authStore.hasRoutePermission()) {
    errorHandler(PAGE_PERMISSION_DENIED);
    router.replace("/");
  }
});
</script>
<template>
  <!-- GNB (Global Navigation Bar) -->
  <nav class="gnb">
    <div class="logo-menu-container">
      <div class="logo">
        <router-link to="/">
          <img src="/images/logo.png" alt="Wisebirds" />
        </router-link>
      </div>
      
      <div class="menu">
        <template
          v-for="(route) in routes"
          :key="route.path"
        >
          <router-link
            v-if="authStore.hasRoutePermission(route.meta)"
            class="actions"
            :to="route.path"
          >
            {{ route.meta.title }}
          </router-link>
        </template>
      </div>
    </div>

    <div class="user-info">
      <popover-profile
        v-if="isAuthenticated"
        :key="userAuth.id"
        style="margin-right: 20px"
      >
        <template #popover-button-label>
          <div class="actions">{{ userAuth.email }}</div>
        </template>
        <template #default>
          <div class="popover-content">
            <p class="popover-title">{{ userAuth.name }}</p>
            <p>{{ userAuth.email }}</p>
            <p>{{ userAuth.company.name }}</p>
          </div>
        </template>
      </popover-profile>
      <drop-down-menu
        id="role-select"
        :options="roleOptions"
        :disabled="!isAuthenticated"
        :value="userAuth.permission"
        @change="authStore.setPermission($event.value)"
      />
    </div>
  </nav>
</template>
<style scoped></style>