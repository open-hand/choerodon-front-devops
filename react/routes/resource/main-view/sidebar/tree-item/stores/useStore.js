import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';

export default function useStore() {
  return useLocalStore(() => ({
    deleteInstance(projectId, istId) {
      return axios.delete(`devops/v1/projects/${projectId}/app_service_instances/${istId}/delete`);
    },
    changeIstActive(projectId, istId, active) {
      return axios.put(
        `devops/v1/projects/${projectId}/app_service_instances/${istId}/${active}`,
      );
    },
    removeService(projectId, envId, appServiceIds) {
      return axios.delete(`/devops/v1/projects/${projectId}/env/app_services?env_id=${envId}&app_service_id=${appServiceIds}`);
    },

    deleteCustom(projectId, resourceId) {
      return axios.delete(`/devops/v1/projects/${projectId}/customize_resource?resource_id=${resourceId}`);
    },

    async checkPipelineReference({ projectId, instanceId }) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/pipeline_reference`);
        if (res && res.pipelineName) {
          return res;
        }
        // 实例没有关联的应用流水线时返回false
        return false;
      } catch (e) {
        return false;
      }
    },
  }));
}
