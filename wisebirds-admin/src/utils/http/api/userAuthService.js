import {fetchClient} from '@/utils/http/fetchClient.js';
import {ResultWrapperFactory} from '@/utils/factory/ResultWrapperFactory.js';


export const userAuthService = () => {
  return fetchClient("/api/auth/me", { method: 'GET' })
    .then((res) => {
      return /** @type {Type.ResultWrapper<{ data: User.Auth }>} */ResultWrapperFactory.create({
        result: true,
        data: (/** @type {User.Auth} */res)
      });
    });
}