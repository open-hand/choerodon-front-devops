import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import { axios } from '@choerodon/boot';

export default class BaseComDeployServices {
  static axiosGetParamsSetting(middlewareName, deployPattern, deployModel) {
    return axios.get(BaseComDeployApis
      .getParamsSettingApi(middlewareName, deployPattern, deployModel));
  }

  static axiosGetServiceVersion(name) {
    return axios.get(BaseComDeployApis.getServiceVersionApi(name));
  }

  static axiosPostBaseDeployMySqlEnvApi(projectId, data) {
    return axios.post(BaseComDeployApis.getBaseDeployMySqlEnvAPi(projectId), data);
  }

  static axiosPostBaseDeployMySqlHostApi(projectId, data) {
    return axios.post(BaseComDeployApis.getBaseDployMySqlHostApi(projectId), data);
  }

  static axiosGetMiddlewareValue(appVersionId, mode) {
    return axios.get(BaseComDeployApis.getMiddleValueApi(appVersionId, mode));
  }

  static axiosPostDeployMiddleware(projectId, data) {
    return axios.post(BaseComDeployApis.getDeployMiddlewareApi(projectId), data);
  }

  static axiosPostHostList(projectId) {
    return axios.post(BaseComDeployApis.getHostListApi(projectId), {
      params: [],
      searchParam: {
        type: 'deploy',
      },
    });
  }

  static axiosPostTestHost(projectId, data) {
    return axios.post(BaseComDeployApis.getTestHostApi(projectId), data);
  }

  static axiosPostDeployHost(projectId, data) {
    return axios.post(BaseComDeployApis.getDeployHostApi(projectId), data);
  }
}
