import HostItemApis from '@/routes/host-config/components/content-list/components/hostItem/apis';
import { axios } from '@choerodon/master';

export default class HostItemServices {
  static axiosGetHostDisconnect(projectId: number | string) {
    return axios.get(HostItemApis.getDisConnectApi(projectId));
  }
}
