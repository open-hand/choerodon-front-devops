import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
    checkConnect(projectId, data) {
      return axios.post(`devops/v1/projects/${projectId}/clusters/check_process`, data);
    },
  }));
}
