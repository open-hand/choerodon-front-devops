import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
    checkConnect(projectId, clusterId) {
      return axios.get(`devops/v1/projects/${projectId}/clusters/check_progress?cluster_id=${clusterId}`);
    },
    createK8S(projectId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/clusters/confirm_install`, JSON.stringify(data));
    },
  }));
}
