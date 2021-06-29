import { axios } from '@choerodon/boot';
import AppCenterApi from '@/routes/app-center/apis';

interface checkNameProps {
  projectId: number,
  envId: string,
  name: string,
}

export default class AppCenterDetailServices {
  static checkDeployName({ projectId, name, envId }: checkNameProps) {
    return axios({
      url: AppCenterApi.checkDeployConfigName(projectId),
      method: 'get',
      params: { name: encodeURIComponent(name), env_id: envId },
    });
  }

  static async getAppServiceValue(projectId: number, appServiceId: string) {
    try {
      const res = await axios.get(AppCenterApi.getAppServiceValue(projectId, appServiceId));
      if (res && !res.failed) {
        return res;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
