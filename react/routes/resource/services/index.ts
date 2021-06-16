import ResourceApis from '@/routes/resource/apis';
import { axios } from '@choerodon/boot';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';

export default class ResourceServices {
  static async getEncrypt(ids: string[]) {
    try {
      const res = await axios.post(ResourceApis.getEncrypt(), ids);
      if (res && res.failed) {
        return false;
      }
      return res;
    } catch (e) {
      return false;
    }
  }

  static getWorkLoadJson(
    projectId: number,
    envId: any,
    kind: string,
    name: string,
  ) {
    return axios.get(WorkloadApis.getWorkLoadJson(
      projectId,
      envId,
      kind,
      name,
    ));
  }

  static getWorkLoadYaml(
    projectId: number,
    envId: any,
    type: string,
    workloadId: any,
  ) {
    return axios.get(WorkloadApis.getWorkLoadYaml(
      projectId,
      envId,
      type,
      workloadId,
    ));
  }
}
