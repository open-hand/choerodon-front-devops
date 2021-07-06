import { axios } from '@choerodon/boot';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

export default class HostConfigServices {
  static async stopDocker(projectId: number, hostId: string, instanceId: string) {
    try {
      const res = await axios.put(HostConfigApi.dockerStop(projectId, hostId, instanceId));
      if (res && res.failed) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static async restartDocker(projectId: number, hostId: string, instanceId: string) {
    try {
      const res = await axios.put(HostConfigApi.dockerRestart(projectId, hostId, instanceId));
      if (res && res.failed) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static async startDocker(projectId: number, hostId: string, instanceId: string) {
    try {
      const res = await axios.put(HostConfigApi.dockerStart(projectId, hostId, instanceId));
      if (res && res.failed) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  static async getDeleteShell(projectId: number, hostId: string) {
    try {
      const res = await axios.get(HostConfigApi.getDeleteShell(projectId, hostId));
      if (res && res.failed) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }

  static checkSshPort(projectId: number, ip: string, port: number | string) {
    return axios.get(HostConfigApi.checkSshPort(projectId, ip, port));
  }
}
