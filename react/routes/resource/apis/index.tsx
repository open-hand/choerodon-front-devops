import { axios } from '@choerodon/boot';

export default class ResourceApis {
  static getEncrypt() {
    return '/devops/v1/encrypt';
  }

  static getAutoDeployMsg(envId:string, projectId:string) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/query_auto_deploy`);
  }

  static closeAutoDeploy(envId:string, projectId:string) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/close_auto_deploy`);
  }

  static openAutoDeploy(envId:string, projectId:string) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/${envId}/open_auto_deploy`);
  }
}
