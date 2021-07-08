import { axios } from '@choerodon/boot';
import DeployConfigApis from '../apis';

interface checkNameProps {
  projectId: number,
  envId: string,
  name: string,
}

export default class DeployConfigServices {
  static checkDeployName({ projectId, name, envId }: checkNameProps) {
    return axios({
      url: DeployConfigApis.checkDeployConfigName(projectId),
      method: 'get',
      params: { name: encodeURIComponent(name), env_id: envId },
    });
  }

  static async getAppServiceValue(projectId: number, appServiceId: string) {
    try {
      const res = await axios.get(DeployConfigApis.getAppServiceValue(projectId, appServiceId));
      if (res && !res.failed) {
        return res;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
