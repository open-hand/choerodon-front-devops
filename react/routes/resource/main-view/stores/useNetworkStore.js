import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';
import { handlePromptError } from '../../../../utils';

export default function useStore() {
  return useLocalStore(() => ({
    ist: [],
    setIst(data) {
      this.ist = data;
    },
    get getIst() {
      return this.ist.slice();
    },

    singleData: {},
    setSingleData(data) {
      this.singleData = data;
    },
    get getSingleData() {
      return this.singleData;
    },

    app: [],
    setApp(data) {
      this.app = data;
    },
    get getApp() {
      return this.app;
    },

    ports: [],
    setPorts(data) {
      this.ports = data;
    },
    get getPorts() {
      return this.ports.slice();
    },

    loadDataById(projectId, id) {
      return axios.get(`/devops/v1/projects/${projectId}/service/${id}`)
        .then((res) => {
          if (handlePromptError(res)) {
            this.setSingleData(res);
            if (!res.target.label) {
              this.loadApp(projectId, res.envId, 'update', res.appId);
            }
            return res;
          }
          return false;
        });
    },

    loadInstance(projectId, envId, appId) {
      return axios.get(`/devops/v1/projects/${projectId}/app_service_instances/list_running_instance?env_id=${envId}&app_service_id=${appId}`)
        .then((data) => {
          if (handlePromptError(data)) {
            this.setIst(data);
            return data;
          }
          return false;
        });
    },

    async loadApp(projectId, envId, option, appId) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/list_all`);
        if (handlePromptError(res)) {
          this.setApp(res);
          if (option === 'update' && appId) {
            this.loadInstance(projectId, envId, appId);
          }
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },

    checkNetWorkName(projectId, envId, value) {
      return axios.get(`/devops/v1/projects/${projectId}/service/check_name?env_id=${envId}&name=${value}`);
    },

    createNetwork(projectId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/service`, JSON.stringify(data));
    },

    updateData(projectId, id, data) {
      return axios.put(`/devops/v1/projects/${projectId}/service/${id}`, JSON.stringify(data));
    },

    async loadPorts(projectId, envId, appServiceId) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/env/app_services/list_port?env_id=${envId}&app_service_id=${appServiceId}`);
        if (handlePromptError(res)) {
          this.setPorts(res);
        }
      } catch (e) {
        Choerodon.handleResponseError(e);
      }
    },
  }));
}
