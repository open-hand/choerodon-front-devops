import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
    checkConnect(projectId, clusterString) {
      return axios.get(`devops/v1/projects/${projectId}/clusters/check_progress?key=${clusterString}`);
    },
    createK8S(projectId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/clusters/confirm_install`, JSON.stringify(data));
    },
  }));
}
