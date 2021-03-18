import ResourceApis from '@/routes/resource/apis';
import { axios } from '@choerodon/boot';

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
}
