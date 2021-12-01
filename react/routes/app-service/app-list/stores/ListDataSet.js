import getTablePostData from '../../../../utils/getTablePostData';

export default ((intlPrefix, formatMessage, projectId, dataKey) => ({
  autoQuery: true,
  selection: false,
  paging: true,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return {
        url: `/devops/v1/projects/${projectId}/app_service/page_by_options?checkMember=true`,
        method: 'post',
        data: postData,
      };
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/app_service/${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.name` }) },
    { name: 'code', type: 'string', label: formatMessage({ id: `${intlPrefix}.code` }) },
    { name: 'id', type: 'string' },
    {
      name: 'type', type: 'string', defaultValue: 'normal', label: formatMessage({ id: `${intlPrefix}.type` }),
    },
    { name: 'active', type: 'boolean', label: formatMessage({ id: 'boot.states' }) },
    { name: 'creationDate', type: 'string', label: formatMessage({ id: 'boot.createDate' }) },
    { name: 'repoUrl', type: 'string', label: formatMessage({ id: `${intlPrefix}.repoUrl` }) },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.name` }) },
    { name: 'code', type: 'string', label: formatMessage({ id: `${intlPrefix}.code` }) },
  ],
}));
