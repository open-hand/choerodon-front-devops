import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';

export default function useStore() {
  return useLocalStore(() => ({
    data: null,
    loading: false,
    loadCodeQualityData(projectId, appServeiceId) {
      this.loading = true;
      axios.get(`/devops/v1/projects/${projectId}/app_service/${appServeiceId}/sonarqube`).then((res) => {
        if (res && !res.failed) {
          this.data = res;
          this.loading = false;
        }
      });
    },
  }));
}
