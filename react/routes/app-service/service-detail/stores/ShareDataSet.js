import getTablePostData from '../../../../utils/getTablePostData';

export default ((intlPrefix, formatMessage, projectId, id, organizationId) => ({
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);
      if (id) {
        return {
          url: `/devops/v1/projects/${projectId}/app_service_share/page_by_options?app_service_id=${id}`,
          method: 'post',
          data: postData,
        };
      }
      return undefined;
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/app_service_share/${data.id}`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'versionType', type: 'string', label: formatMessage({ id: `${intlPrefix}.version.type` }) },
    {
      name: 'version', type: 'string', textField: 'version', valueField: 'version', label: formatMessage({ id: `${intlPrefix}.version.specific` }),
    },
    { name: 'id', type: 'string', label: formatMessage({ id: 'boot.number' }) },
    { name: 'viewId', type: 'string', label: formatMessage({ id: 'boot.number' }) },
    { name: 'projectId', type: 'number' },
    { name: 'projectName', type: 'string', label: formatMessage({ id: `${intlPrefix}.share.range` }) },
  ],
  queryFields: [
    // { name: 'id', type: 'string', label: formatMessage({ id: 'boot.number' }) },
    {
      name: 'version', type: 'string', textField: 'version', valueField: 'version', label: formatMessage({ id: `${intlPrefix}.version.specific` }),
    },
  ],
}));
