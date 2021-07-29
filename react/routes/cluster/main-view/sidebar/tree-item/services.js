import { axios } from '@choerodon/master';
import TreeItemApis from '@/routes/cluster/main-view/sidebar/tree-item/api';

export default class TreeItemService {
  static axiosGetDisConnect(projectId, clusterId) {
    return axios.get(TreeItemApis.getDisConnectApi(projectId, clusterId));
  }
}
