import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {PERMISSIONS_CODE} from '@/constants/commonConstants.js';
import {isValidValue} from '@/utils/functions/useJsUtils.js';
import {secureLs} from '@/store/storage/index.js';
import {useRoute} from 'vue-router';
import {userAuthService} from '@/utils/http/api/userAuthService.js';
import {useConcurrentTasks} from '@/composables/useConcurrentTasks.js';

export const useAuthStore = defineStore('auth', () => {
  const id = ref(null);
  const email = ref(null);
  const name = ref(null);
  const company = ref({ id: null, name: '' });
  
  const permission = ref(PERMISSIONS_CODE.VIEWER);
  
  const userAuth = computed(() => /** @type {User.Auth & { permission: Type.Permission }} */({
    id: id.value,
    email: email.value,
    name: name.value,
    company: company.value,
    permission: permission.value,
  }));
  const isAuthenticated = computed(() => !!id.value);
  
  const setPermission = (targetValue) => {
    if (Object.values(PERMISSIONS_CODE).includes(targetValue)) {
      permission.value = targetValue;
    }
  }
  const route = useRoute();
  const hasRoutePermission = (option = route.meta) => {
    const { permissions } = option;
    return !isValidValue(permissions) || permissions.includes(permission.value);
  };
  
  const isUserAuthenticating = ref(false);
  /**
   * @type {function(): Promise<Type.ResultWrapper<{ data: * } | { error: Error|unknown }>>}
   */
  const fetchUserAuth = useConcurrentTasks(() => {
    return userAuthService().then((res) => {
      if (!res.result) {
        return res;
      }
      const { id: _id, name: _name, email: _email, company: _company } = res.data;
      id.value = _id;
      name.value = _name;
      email.value = _email;
      company.value = _company;
      return res;
    });
  }, isUserAuthenticating);

  return {
    userAuth,
    isAuthenticated,
    permission,
    hasRoutePermission,
    setPermission,
    fetchUserAuth,
  };
}, {
  persist: {
    key: 'permission',
    storage: {
      getItem: (key) => {
        try {
          return secureLs.get(key);
        } catch (error) {
          console.error(error);
          return null;
        }
      },
      setItem: (key, value) => secureLs.set(key, value),
    },
    pick: [ 'permission' ],
  },
})