import { createWebHistory, createRouter } from 'vue-router';
import {useAuthStore} from '@/store/modules/useAuthStore.js';
import {PAGE_PERMISSION_DENIED, PERMISSIONS_CODE} from '@/constants/commonConstants.js';
import {errorHandler} from '@/utils/functions/useJsUtils.js';

const checkPermission = (to, from, next) => {
  const authStore = useAuthStore();
  if (authStore.hasRoutePermission(to.meta)) {
    next();
    return;
  }
  errorHandler(PAGE_PERMISSION_DENIED);
  next(false);
}

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  history: createWebHistory(),
  /** @type {import('vue-router').RouteRecordRaw[]} */
  routes: [
    {
      path: '/',
      component: () => import('@/components/templates/AppMainLayout.vue'),
      children: [
        {
          path: 'admin/campaigns/main',
          component: () => import('@/components/pages/admin/campaign/CampaignMain.vue'),
          meta: { title: '캠페인' }
        },
        {
          path: 'admin/user/main',
          component: () => import('@/components/pages/admin/user/UserMain.vue'),
          meta: { permissions: [ PERMISSIONS_CODE.ADMIN ], title: '사용자' },
          beforeEnter: checkPermission
        }
      ]
    }
  ]
});

router.beforeEach(async(to, from, next) => {
  const authStore = useAuthStore();
  try {
    if (!authStore.isAuthenticated) {
      await authStore.fetchUserAuth();
    }
  } catch (error) {
    console.error(error);

  }
  next();
});

export { router };