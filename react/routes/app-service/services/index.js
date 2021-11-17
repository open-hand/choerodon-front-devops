import { axios } from '@choerodon/master';
import AppServiceApis from '@/routes/app-service/apis';

export default class AppServiceServices {
  static axiosGetCheckAdminPermission(projectId) {
    return axios.get(AppServiceApis.getCheckAdminPermission(projectId));
  }
}
