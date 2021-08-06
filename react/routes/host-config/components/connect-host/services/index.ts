import { axios } from '@choerodon/boot';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

export default class HostConnectServices {
  static async getLinkShell(projectId: number, hostId: string) {
    try {
      const res = await axios.get(HostConfigApi.getLinkShell(projectId, hostId));
      if (res && res.failed) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }

  static async testConnect(projectId: number, hostId: string, postData: object) {
    try {
      const res = await axios.post(HostConfigApi.testHostConnect(projectId, hostId), postData);
      if (res && res.failed) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }

  static async getHostConnectStatus(projectId: number, hostId: string) {
    try {
      const res = await axios.get(HostConfigApi.hostConnect(projectId, hostId));
      if (res && res.failed) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }
}
