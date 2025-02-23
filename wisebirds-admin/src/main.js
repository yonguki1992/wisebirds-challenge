import '@/assets/styles/main.css';
import { createApp } from 'vue';
import { router } from '@/routes/index.js';
import { pinia } from '@/store/index.js';
import App from '@/App.vue';

import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseSpinner from '@/components/atoms/BaseSpinner.vue';
import BaseToggleSwitch from '@/components/atoms/BaseToggleSwitch.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import { faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons';

/* add icons to the library */
library.add(faEyeSlash, faEye, faXmark);

createApp(App)
  .use(pinia)
  .use(router)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('base-button', BaseButton)
  .component('base-input', BaseInput)
  .component('base-spinner', BaseSpinner)
  .component('base-toggle-switch', BaseToggleSwitch)
  .mount('#app');
