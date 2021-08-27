/* eslint-disable max-len */
import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '@/utils';
import { CHART_CATERGORY, DEPLOY_CATERGORY } from '@/routes/app-center-pro/stores/CONST';
import { appServiceInstanceApi, appServiceInstanceApiConfig, deployAppCenterApi } from '@/api';
import { deploymentsApiConfig } from '@/api/Deployments';

type DeploymentJsonType = 'deploymentVOS'| 'statefulSetVOS' |'daemonSetVOS'

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
    async loadDeploymentsJson(type: DeploymentJsonType, instance: any, name: any, groupType:string) {
      let axiosConfig;
      if (groupType === CHART_CATERGORY) {
        axiosConfig = appServiceInstanceApiConfig.loadDeploymentsJson(type, name, instance);
      } else if (groupType === DEPLOY_CATERGORY) {
        axiosConfig = deploymentsApiConfig.getDeploymentsJson(instance);
      }
      try {
        const data = await axios(axiosConfig);
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
    async loadDeploymentsYaml(type:DeploymentJsonType, instance: any, name: any, groupType:string) {
      let url;
      if (groupType === CHART_CATERGORY) {
        url = appServiceInstanceApiConfig.loadDeploymentsYaml(type, name, instance);
      } else if (groupType === DEPLOY_CATERGORY) {
        url = deploymentsApiConfig.getDeploymentsYaml(instance);
      }

      try {
        const data = await axios
          .get(url);
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
      return appServiceInstanceApi.operatePodCount(name, num, kind, envId);
    },

    async loadResource() {
      this.setLoading(true);

      try {
        const data = await deployAppCenterApi.loadEnvSource(appCenterId);
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
