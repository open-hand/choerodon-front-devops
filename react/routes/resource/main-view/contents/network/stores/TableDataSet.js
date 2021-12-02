import getTablePostData from '../../../../../../utils/getTablePostData';

export default ({
  formatMessage, intlPrefix, projectId, envId, format,
}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return ({
        url: `/devops/v1/projects/${projectId}/service/page_by_options?env_id=${envId}`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/service/${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: format({ id: 'ServiceName' }) },
    { name: 'error', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'config', type: 'object' },
    { name: 'type', type: 'string', label: format({ id: 'ConfigurationType' }) },
    { name: 'loadBalanceIp', type: 'string' },
    { name: 'target', type: 'object' },
    { name: 'appId', type: 'string' },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: format({ id: 'ServiceName' }) },
  ],
});
