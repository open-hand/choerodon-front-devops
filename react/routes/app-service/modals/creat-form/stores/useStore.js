import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';
import { handlePromptError } from '../../../../../utils';

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

    async loadAppService(projectId, type) {
      this.setAppService([]);
      this.setAppServiceLoading(true);
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/list_all_app_services?deploy_only=false&type=${type}`);
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
