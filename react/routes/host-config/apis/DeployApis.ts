import { axios } from '@choerodon/boot';

export default class HostConfigApi {
  static checkName(projectId: number, name: string) {
    return axios.get(`/devops/v1/projects/${projectId}/hosts/check/name_unique?name=${name}`);
  }

  static createHost(projectId: number) {
    return `/devops/v1/projects/${projectId}/hosts`;
  }

  static editHost(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static getHostDetail(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static getLoadHostsDetailsUrl(projectId:number) {
    return `/devops/v1/projects/${projectId}/hosts/page_by_options?with_updater_info=true`;
  }

  static getDeleteHostUrl(projectId:number, hostId:string) {
    return axios.delete(`/devops/v1/projects/${projectId}/hosts/${hostId}`);
  }

  // 检查主机是否能被删除
  static checkHostDeletable(projectId:number, hostId:string) {
    return axios.get(`/devops/v1/projects/${projectId}/hosts/check/delete?host_id=${hostId}`);
  }

  static getLinkShell(projectId:number, hostId:string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/link_shell`;
  }
}
