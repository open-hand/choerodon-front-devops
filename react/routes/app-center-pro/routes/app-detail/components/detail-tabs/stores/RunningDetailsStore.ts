/* eslint-disable max-len */
import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '@/utils';

export default function useStore({ projectId, appCenterId, envId }:any) {
  return useLocalStore(() => ({
    resources: {},

    loading: true,

    deployments: {},

    deploymentsYaml: '',

    targetCount: {},

    setTargetCount(count: any) {
      this.targetCount = count;
    },

    get getTargetCount() {
      return this.targetCount;
    },

    setResources(data: any) {
      this.resources = data;
    },

    get getResources() {
      return this.resources;
    },

    setLoading(data: any) {
      this.loading = data;
    },

    get getLoading() {
      return this.loading;
    },

    setDeployments(data: any) {
      this.deployments = data;
    },

    get getDeployments() {
      return this.deployments;
    },

    setDeploymentsYaml(data: any) {
      this.deploymentsYaml = data;
    },

    get getDeploymentsYaml() {
      return this.deploymentsYaml;
    },

    /**
   * 根据实例id获取更多部署详情(Json格式)
   * @param type
   * @param project
   * @param instance
   * @param name
   */
    async loadDeploymentsJson(type: string | number, project: any, instance: any, name: any) {
      const URL_TYPE:any = {
        deploymentVOS: `deployment_detail_json?deployment_name=${name}`,
        statefulSetVOS: `stateful_set_detail_json?stateful_set_name=${name}`,
        daemonSetVOS: `daemon_set_detail_json?daemon_set_name=${name}`,
      };

      try {
        const data = await axios
          .get(`devops/v1/projects/${project}/app_service_instances/${instance}/${URL_TYPE[type]}`);
        const res = handlePromptError(data);
        if (res) {
          this.setDeployments(data);
          return true;
        }
        return false;
      } catch (e) {
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    /**
   * 根据实例id获取更多部署详情(Yaml格式)
   * @param type
   * @param project
   * @param instance
   * @param name
   */
    async loadDeploymentsYaml(type: string | number, project: any, instance: any, name: any) {
      const URL_TYPE:any = {
        deploymentVOS: `deployment_detail_yaml?deployment_name=${name}`,
        statefulSetVOS: `stateful_set_detail_yaml?stateful_set_name=${name}`,
        daemonSetVOS: `daemon_set_detail_yaml?daemon_set_name=${name}`,
      };

      try {
        const data = await axios
          .get(`devops/v1/projects/${project}/app_service_instances/${instance}/${URL_TYPE[type]}`);
        const res = handlePromptError(data);
        if (res) {
          this.setDeploymentsYaml(data.detail || '');
          return true;
        }
        this.setDeploymentsYaml('');
        return false;
      } catch (e) {
        this.setDeploymentsYaml('');
        Choerodon.handleResponseError(e);
        return false;
      }
    },

    operatePodCount(name: any, num: any, kind: any) {
      return axios
        .put(
          `devops/v1/projects/${projectId}/app_service_instances/operate_pod_count?envId=${envId}&name=${name}&count=${num}&kind=${kind}`,
        );
    },

    async loadResource() {
      this.setLoading(true);

      try {
        const data = await axios
          .get(`devops/v1/projects/${projectId}/deploy_app_center/${appCenterId}/env_resources`);
        const res = handlePromptError(data);
        if (res) {
          this.setResources(data);
        }
        this.setLoading(false);
      } catch (e) {
        this.setLoading(false);
      }
    },

  }));
}

export type StoreProps = ReturnType<typeof useStore>;
