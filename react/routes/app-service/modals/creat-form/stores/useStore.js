import { useLocalStore } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/master';
import { handlePromptError } from '../../../../../utils';
import { appServiceApi } from '@/api';

export default function useStore() {
  return useLocalStore(() => ({
    appServiceLoading: false,
    setAppServiceLoading(flag) {
      this.appServiceLoading = flag;
    },
    get getAppServiceLoading() {
      return this.appServiceLoading;
    },

    appService: [],
    setAppService(data) {
      this.appService = data;
    },
    get getAppService() {
      return this.appService.slice();
    },

    async loadAppService(type) {
      this.setAppService([]);
      this.setAppServiceLoading(true);
      try {
        const res = await appServiceApi.listAllAppservices(type);
        if (handlePromptError(res)) {
          this.setAppService(res);
        }
        this.setAppServiceLoading(false);
      } catch (e) {
        this.setAppServiceLoading(false);
        Choerodon.handleResponseError(e);
      }
    },
  }));
}
