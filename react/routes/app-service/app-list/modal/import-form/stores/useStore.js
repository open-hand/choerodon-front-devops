import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '../../../../../../utils';
import { appServiceApi } from '@/api/AppService';

export default function useStore() {
  return useLocalStore(() => ({
    repeatData: {
      listName: [],
      listCode: [],
    },
    get getRepeatData() {
      return this.repeatData;
    },
    setRepeatData(data) {
      this.repeatData = data;
    },

    allProject: [],
    setAllProject(data) {
      this.allProject = data;
    },
    get getAllProject() {
      return this.allProject.slice();
    },

    skipCheck: false,
    get getSkipCheck() {
      return this.skipCheck;
    },
    setSkipCheck(data) {
      this.skipCheck = data;
    },

    async batchCheck(projectId, listCode, listName) {
      try {
        const res = await appServiceApi.batchCheck(JSON.stringify({ listCode, listName }));
        if (handlePromptError(res)) {
          this.setRepeatData(res);
          return res;
        }
        return false;
      } catch (e) {
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    async loadAllProject(projectId, isShare) {
      try {
        const res = await appServiceApi.listProjectsByShare(isShare);
        if (handlePromptError(res)) {
          this.setAllProject(res);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },
  }));
}
