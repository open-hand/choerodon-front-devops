import { axios } from '@choerodon/boot';

export default class HostConfigApi {
  static checkName(projectId: number, name: string) {
    return axios.get(`/test/v1/projects/${projectId}/hosts/check/name_unique?name=${name}`);
  }

  static createHost(projectId: number) {
    return `/test/v1/projects/${projectId}/hosts`;
  }

  static editHost(projectId: number, hostId: string) {
    return `/test/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static testConnection(projectId: number, data: object) {
    return axios.post(`/test/v1/projects/${projectId}/hosts/connection_test`, JSON.stringify(data));
  }

  static checkSshPort(projectId: number, ip: string, port: any) {
    return axios.get(`/test/v1/projects/${projectId}/hosts/check/ssh_unique?ip=${ip}&ssh_port=${port}`);
  }

  static checkJmeterPort(projectId: number, ip: string, port: any) {
    return axios.get(`/test/v1/projects/${projectId}/hosts/check/jmeter_unique?ip=${ip}&jmeter_port=${port}`);
  }

  static getHostDetail(projectId: number, hostId: string) {
    return `/test/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static getLoadHostsDetailsUrl(projectId:number) {
    return `/test/v1/projects/${projectId}/hosts/page_by_options?with_updater_info=true`;
  }

  static getDeleteHostUrl(projectId:number, hostId:string) {
    return axios.delete(`/test/v1/projects/${projectId}/hosts/${hostId}`);
  }

  static batchCorrect(projectId:number, data: any) {
    return axios.post(`/test/v1/projects/${projectId}/hosts/batch_correct`, JSON.stringify(data));
  }

  // 检查主机是否能被删除
  static checkHostDeletable(projectId:number, hostId:string) {
    return axios.get(`/test/v1/projects/${projectId}/hosts/check/delete?host_id=${hostId}`);
  }
}
