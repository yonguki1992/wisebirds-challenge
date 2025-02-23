import {isValidValue} from '@/utils/functions/useJsUtils.js';
import SecureLS from 'secure-ls';

export const secureLs = new SecureLS({
  encodingType: "aes",
  isCompression: false,
  encryptionSecret: import.meta.env.VITE_ECRYPTION_SECRET_KEY,
  storage: {
    getItem: (key) => {
      let data = localStorage.getItem(key);
      if (isValidValue(data) === true) {
        return data;
      }
      return null;
    },
    removeItem: (key) => {
      let data = localStorage.getItem(key);
      if (isValidValue(data) === true) {
        localStorage.removeItem(key);
      }
    },
    setItem: (key, value) => {
      localStorage.setItem(key, value);
    },
  },
});