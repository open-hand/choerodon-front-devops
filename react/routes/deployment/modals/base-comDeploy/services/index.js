import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import { axios } from '@choerodon/boot';

export default class BaseComDeployServices {
  // static axiosGetServiceVersion() {
  //   return axios.get(BaseComDeployApis.getServiceVersionApi());
  // }

  static axiosGetMiddlewareValue(appVersionId, mode) {
    return axios.get(BaseComDeployApis.getMiddleValueApi(appVersionId, mode));
  }

  static axiosPostDeployMiddleware(projectId, data) {
    return axios.post(BaseComDeployApis.getDeployMiddlewareApi(projectId), data);
  }
}
