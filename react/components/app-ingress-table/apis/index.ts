import { axios } from '@choerodon/boot';

export default class HostConfigApi {
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
}
