import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';

export default function useStore() {
  return useLocalStore(() => ({
    queryActivateClusterShell(projectId, clusterId) {
      return axios.get(`/devops/v1/projects/${projectId}/clusters/query_shell/${clusterId}`);
    },
    queryClusterDetail(projectId, clusterId) {
      return axios.get(`devops/v1/projects/${projectId}/clusters/${clusterId}`);
    },
    retryCluster(projectId, clusterId) {
      return axios.post(`devops/v1/projects/${projectId}/clusters/retry_create?cluster_id=${clusterId}`);
    },
  }));
}
