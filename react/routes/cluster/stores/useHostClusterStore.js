/* eslint-disable max-len */
import {
  forEach, omit, map, difference,
} from 'lodash';
import { axios } from '@choerodon/boot';
import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    calculateType(typeArr) {
      let num = 0;
      forEach(typeArr, (key) => {
        switch (key) {
          case 'master':
            num += 4;
            break;
          case 'etcd':
            num += 2;
            break;
          case 'worker':
            num += 1;
            break;
          default:
            break;
        }
      });
      return num;
    },
    handleClusterCreateNodesInnerData(data) {
      return map(data, (item) => {
        const tempItem = omit(item, ['__id', '__status', 'hasError']);
        tempItem.role = this.calculateType(tempItem?.role);
        return tempItem;
      });
    },
    handleClusterCreateNodesOutterData(obj) {
      const tempArr = ['hostPort', 'hostIp', 'username', 'password', 'authType'];
      const allKeys = difference(Object.keys(obj), tempArr);
      if (!allKeys.length) {
        const tempObj = omit(obj, ['__id', '__status', 'hasError', 'status']);
        return tempObj;
      }
      return {};
    },
    handleClusterByHostsData(value) {
      const source = omit(JSON.parse(value), ['__id', '__status']);
      const hasInner = source?.devopsClusterInnerNodeVOList?.length;
      const hasOutter = source?.devopsClusterOutterNodeVO?.length;
      source.devopsClusterInnerNodeVOList = hasInner ? this.handleClusterCreateNodesInnerData(source?.devopsClusterInnerNodeVOList) : [];
      source.devopsClusterOutterNodeVO = hasOutter ? this.handleClusterCreateNodesOutterData(source?.devopsClusterOutterNodeVO[0]) : {};
      return JSON.stringify(source);
    },

    checkClusterName({ projectId, clusterName }) {
      return axios.get(`/devops/v1/projects/${projectId}/clusters/check_name?name=${clusterName}`);
    },
    checkClusterCode({ projectId, clusterCode }) {
      return axios.get(`/devops/v1/projects/${projectId}/clusters/check_code?code=${clusterCode}`);
    },
    checkNodeConnect(projectId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/nodes/connection_test`, JSON.stringify(data));
    },
  }));
}
