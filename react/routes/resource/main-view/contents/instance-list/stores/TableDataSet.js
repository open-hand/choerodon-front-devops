/* eslint-disable import/no-anonymous-default-export */
import getTablePostData from '../../../../../../utils/getTablePostData';

export default ({
  formatMessage, intlPrefix, projectId, envId,
}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);

      return ({
        url: `/devops/v1/projects/${projectId}/app_service_instances/info/page_by_options?env_id=${envId}`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/app_service_instances/${data.id}/delete`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'appCode', type: 'string', label: formatMessage({ id: 'appCode' }) },
    { name: 'appName', type: 'string', label: formatMessage({ id: 'appName' }) },
    { name: 'versionName', type: 'string', label: 'Chart版本' },
    { name: 'appServiceName', type: 'string', label: 'Chart来源' },
    { name: 'status', type: 'string' },
    { name: 'podRunningCount', type: 'number' },
    { name: 'podCount', type: 'number' },
    { name: 'connect', type: 'string' },
    { name: 'error', type: 'string' },
    { name: 'projectId', type: 'string' },
  ],
  queryFields: [
    { name: 'appCode', type: 'string', label: formatMessage({ id: 'appCode' }) },
    { name: 'appName', type: 'string', label: formatMessage({ id: 'appName' }) },
    { name: 'versionName', type: 'string', label: formatMessage({ id: 'Chart版本' }) },
  ],
});
