import { axios } from '@choerodon/boot';
import InstanceApis from '@/routes/resource/apis/instanceApis';

export default class MarkerUpgradeServices {
  static getMarketService(projectId: number, instanceId: string, versionId: string) {
    return axios.get(InstanceApis.getMarketValue(projectId, instanceId, versionId));
  }
}
