import { axios } from '@choerodon/boot';

function getPrefix(type: string) {
  return type === 'deploy' ? 'devops' : 'test';
}

export default class HostConfigApi {
  static checkName(projectId: number, name: string, type: string) {
    return axios.get(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/check/name_unique?name=${name}`);
  }

  static createHost(projectId: number, type: string) {
    return `/${getPrefix(type)}/v1/projects/${projectId}/hosts`;
  }

  static editHost(projectId: number, hostId: string, type: string) {
    return `/${getPrefix(type)}/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static testConnection(projectId: number, data: object, type: string) {
    return axios.post(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/connection_test`, JSON.stringify(data));
  }

  static checkSshPort(projectId: number, ip: string, port: any, type: string) {
    return axios.get(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/check/ssh_unique?ip=${ip}&ssh_port=${port}`);
  }

  static checkJmeterPort(projectId: number, ip: string, port: any) {
    return axios.get(`/test/v1/projects/${projectId}/hosts/check/jmeter_unique?ip=${ip}&jmeter_port=${port}`);
  }

  static getHostDetail(projectId: number, hostId: string, type: string) {
    return `/${getPrefix(type)}/v1/projects/${projectId}/hosts/${hostId}`;
  }

  static getLoadHostsDetailsUrl(projectId:number, type: string) {
    return `/${getPrefix(type)}/v1/projects/${projectId}/hosts/page_by_options?with_updater_info=true&do_page=true`;
  }

  static getDeleteHostUrl(projectId:number, hostId:string, type: string) {
    return axios.delete(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/${hostId}`);
  }

  static batchCorrect(projectId:number, data: any, type: string) {
    return axios.post(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/batch_correct`, JSON.stringify(data));
  }

  // 检查主机是否能被删除
  static checkHostDeletable(projectId:number, hostId:string, type: string) {
    return axios.get(`/${getPrefix(type)}/v1/projects/${projectId}/hosts/check/delete?host_id=${hostId}`);
  }
}
