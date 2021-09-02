import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
    singleData: {},
    setSingleData(data:object) {
      this.singleData = data;
    },
    get getSingleData() {
      return this.singleData;
    },

    async loadSingleData(projectId:string, id:string) {
      const res = await axios.get(`/devops/v1/projects/${projectId}/config_maps/${id}`);
      if (handlePromptError(res)) {
        this.setSingleData(res);
      }
      return res;
    },

    postKV(projectId:string, data:any) {
      const { id } = data;
      if (id) {
        return axios.put(`/devops/v1/projects/${projectId}/config_maps`, JSON.stringify(data));
      }
      return axios.post(`/devops/v1/projects/${projectId}/config_maps`, JSON.stringify(data));
    },

    checkName(projectId:string, envId:string, name:string) {
      return axios(`/devops/v1/projects/${projectId}/config_maps/check_name?envId=${envId}&name=${name}`);
    },
  }));
}

export type FormStoreType = ReturnType<typeof useStore>;
