import { observable, action, computed } from 'mobx';
import { axios, Choerodon } from '@choerodon/boot';
import { handlePromptError } from '../../../../../../utils';

export default class InstanceDetails {
  @observable resources = {};

  @observable loading = true;

  @observable deployments = {};

  @observable deploymentsYaml = '';

  @observable targetCount = {};

  @action setTargetCount(count) {
    this.targetCount = count;
  }

  @computed get getTargetCount() {
    return this.targetCount;
  }

  @action
  setResources(data) {
    this.resources = data;
  }

  @computed
  get getResources() {
    return this.resources;
  }

  @action
  setLoading(data) {
    this.loading = data;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  @action
  setDeployments(data) {
    this.deployments = data;
  }

  @computed
  get getDeployments() {
    return this.deployments;
  }

  @action
  setDeploymentsYaml(data) {
    this.deploymentsYaml = data;
  }

  @computed
  get getDeploymentsYaml() {
    return this.deploymentsYaml;
  }

  /**
   * 根据实例id获取更多部署详情(Json格式)
   * @param type
   * @param project
   * @param instance
   * @param name
   */
  async loadDeploymentsJson(type, project, instance, name) {
    const URL_TYPE = {
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
  }

  /**
   * 根据实例id获取更多部署详情(Yaml格式)
   * @param type
   * @param project
   * @param instance
   * @param name
   */
  async loadDeploymentsYaml(type, project, instance, name) {
    const URL_TYPE = {
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
  }

  operatePodCount(projectId, envId, name, num, kind) {
    return axios
      .put(
        `devops/v1/projects/${projectId}/app_service_instances/operate_pod_count?envId=${envId}&name=${name}&count=${num}&kind=${kind}`,
      );
  }

  async loadResource(projectId, instanceId) {
    this.setLoading(true);

    try {
      const data = await axios
        .get(`/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/resources`);
      const res = handlePromptError(data);
      if (res) {
        this.setResources(data);
      }
      this.setLoading(false);
    } catch (e) {
      this.setLoading(false);
    }
  }
}
