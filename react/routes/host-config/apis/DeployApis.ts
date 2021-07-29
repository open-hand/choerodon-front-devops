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

  static getDockerList(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/docker_process`;
  }

  static getJarList(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/java_process`;
  }

  static getResourceInfo(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/resource_usage_info`;
  }

  static dockerRestart(projectId: number, hostId: string, instanceId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/docker_process/${instanceId}/restart`;
  }

  static dockerStop(projectId: number, hostId: string, instanceId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/docker_process/${instanceId}/stop`;
  }

  static dockerStart(projectId: number, hostId: string, instanceId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/docker_process/${instanceId}/start`;
  }

  static dockerDelete(projectId: number, hostId: string, instanceId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/docker_process/${instanceId}`;
  }

  static jarDelete(projectId: number, hostId: string, instanceId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/java_process/${instanceId}`;
  }

  static getDeleteShell(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/uninstall_shell`;
  }

  static checkSshPort(projectId: number, ip: string, port: number | string) {
    return `/devops/v1/projects/${projectId}/hosts/check/ssh_unique?ip=${ip}&ssh_port=${port}`;
  }

  static getAppInstanceList(projectId: number) {
    return `/devops/v1/projects/${projectId}/hosts/instance/list`;
  }

  static hostConnect(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/connection_host`;
  }

  static testHostConnect(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/connection_host_test`;
  }

  static getHostPermissionList(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/permission/page_by_options`;
  }

  static getHostNonRelated(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/permission/list_non_related`;
  }

  static updateHostPermission(projectId: number, hostId: string) {
    return `/devops/v1/projects/${projectId}/hosts/${hostId}/permission`;
  }
}
