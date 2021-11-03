import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '../../../utils';
import { marketHzeroApi } from '../../../api';

export default function useStore() {
  return useLocalStore(() => ({
    appServiceLoading: false,
    setAppServiceLoading(flag) {
      this.appServiceLoading = flag;
    },
    get getAppServiceLoading() {
      return this.appServiceLoading;
    },
    appService: [],
    setAppService(data) {
      this.appService = data;
    },
    get getAppService() {
      return this.appService.slice();
    },

    shareAppService: [],
    setShareAppService(data) {
      this.shareAppService = data;
    },
    get getShareAppService() {
      return this.shareAppService.slice();
    },

    configValue: '',
    setConfigValue(data) {
      this.configValue = data;
    },
    get getConfigValue() {
      return this.configValue;
    },

    certificates: [],
    setCertificates(data) {
      this.certificates = data;
    },
    get getCertificates() {
      return this.certificates;
    },

    hzeroSyncStatus: null,
    get getHzeroSyncStatus() {
      return this.hzeroSyncStatus;
    },
    setHzeroSyncStatus(data) {
      this.hzeroSyncStatus = data;
    },

    async startPipeline(projectId, pipelineIds) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/pipeline/batch_execute?pipelineIds=${pipelineIds}`);
        return handlePromptError(res);
      } catch (e) {
        return false;
      }
    },

    async loadAppService(projectId, type) {
      try {
        this.setAppServiceLoading(true);
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/list_all_app_services?service_type=normal&deploy_only=true&type=${type}`);
        if (handlePromptError(res)) {
          this.setAppService(res);
        }
        this.setAppServiceLoading(false);
      } catch (e) {
        this.setAppServiceLoading(false);
        Choerodon.handleResponseError(e);
      }
    },

    async loadShareAppService(projectId) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/list_all_app_services?service_type=normal&deploy_only=true&type=share_service`);
        if (handlePromptError(res)) {
          this.setShareAppService(res);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },

    async loadConfigValue(projectId, id) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/deploy_value?value_id=${id}`);
        if (handlePromptError(res)) {
          this.setConfigValue(res.value);
          return res.value;
        }
        return true;
      } catch (e) {
        return Choerodon.handleResponseError(e);
      }
    },

    async loadDeployValue(projectId, id) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/deploy_value?version_id=${id}&type=create`);
        if (handlePromptError(res)) {
          this.setConfigValue(res.yaml);
          return res.yaml;
        }
        return true;
      } catch (e) {
        return Choerodon.handleResponseError(e);
      }
    },

    async loadMarketDeployValue(projectId, id) {
      try {
        const res = await axios.get(`/market/v1/projects/${projectId}/deploy/values?deploy_object_id=${id}`);
        if (handlePromptError(res)) {
          this.setConfigValue(res.value);
          return res.value;
        }
        return true;
      } catch (e) {
        return Choerodon.handleResponseError(e);
      }
    },

    checkNetWorkName(projectId, envId, value) {
      return axios.get(`/devops/v1/projects/${projectId}/service/check_name?env_id=${envId}&name=${value}`);
    },

    async loadCertByEnv(projectId, envId, domain) {
      try {
        const res = await axios.post(`/devops/v1/projects/${projectId}/certifications/active?env_id=${envId}&domain=${domain}`);
        if (handlePromptError(res)) {
          this.setCertificates(res);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },

    checkName(projectId, value, envId) {
      return axios.get(`/devops/v1/projects/${projectId}/ingress/check_name?env_id=${envId}&name=${value}`);
    },

    checkPath(projectId, domain, env, value, id = '') {
      return axios.get(`/devops/v1/projects/${projectId}/ingress/check_domain?domain=${domain}&env_id=${env}&path=${value}&id=${id}`);
    },

    async loadHzeroSyncStatus() {
      try {
        const res = await marketHzeroApi.loadSyncStatus();
        if (res && !res.failed) {
          this.setHzeroSyncStatus(res);
        } else {
          this.setHzeroSyncStatus(null);
        }
      } catch (e) {
        this.setHzeroSyncStatus(null);
      }
    },
  }));
}
