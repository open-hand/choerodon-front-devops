/* eslint-disable max-len */
import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
import { omit, map, forEach } from 'lodash';
import { handlePromptError } from '../../../../../../../utils';

export default function useStore() {
  return useLocalStore(() => ({
    permissionUpdate({ projectId, clusterId, ...rest }) {
      const data = {
        clusterId,
        ...rest,
      };
      return axios.post(`/devops/v1/projects/${projectId}/clusters/${clusterId}/permission`, JSON.stringify(data));
    },
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
    handleClusterCreateNodesData(data) {
      return map(data, (item) => {
        const tempItem = omit(item, ['__id', '__status', 'hasError', 'status']);
        tempItem.role = this.calculateType(tempItem?.role);
        return tempItem;
      });
    },
    handleClusterByHostsData(value) {
      const source = omit(JSON.parse(value), ['__id', '__status']);
      if (source?.devopsClusterNodeVOList) {
        source.devopsClusterNodeVOList = this.handleClusterCreateNodesData(source?.devopsClusterNodeVOList);
      }
      return JSON.stringify(source);
    },
    modalErrorMes: null,
    setModalErrorMes(value) {
      this.modalErrorMes = value;
    },
  }));
}
