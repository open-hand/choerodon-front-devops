/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import { omit, map, forEach } from 'lodash';

let clusterName;
export default ({
  mainStore, projectId, formatMessage, intlPrefix, nodesBySingleDS, modalStore,
}) => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  paging: false,
  dataKey: null,
  fields: [
    {
      name: 'role',
      type: 'string',
      label: '节点类型',
      textField: 'text',
      valueField: 'value',
      defaultValue: 'worker',
      required: true,
    },
  ],
  transport: {
    // read: clusterId ? {
    //   url: `devops/v1/projects/${projectId}/clusters/${clusterId}`,
    //   method: 'get',
    // } : undefined,
    // create: ({ data: [data] }) => ({
    //   url: `/devops/v1/projects/${projectId}/clusters/create`,
    //   method: 'post',
    //   data: JSON.stringify(data),
    //   transformRequest: (value) => modalStore.handleClusterByHostsData(value),
    // }),
    // update: ({ data: [data] }) => ({
    //   url: `/devops/v1/projects/${projectId}/clusters/${data.id}?`,
    //   method: 'put',
    //   data: JSON.stringify(data),
    //   transformRequest: (value) => modalStore.handleClusterByHostsData(value),
    // }),
  },
  children: {
    devopsClusterNodeVOList: nodesBySingleDS,
  },
});
