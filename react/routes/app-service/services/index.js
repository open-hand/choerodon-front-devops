import AppServiceApis from '@/routes/app-service/apis';
import { axios } from '@choerodon/master';

export default class AppServiceServices {
  static axiosGetCheckAdminPermission(projectId) {
    return axios.get(AppServiceApis.getCheckAdminPermission(projectId));
  }
}
