export default ({
  formatMessage, intlPrefix, projectId, envId, format,
}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => ({
      // url: `/devops/v1/projects/${projectId}/deploy_app_center/page_by_env`,
      url: `/devops/v1/projects/${projectId}/deploy_app_center/page_chart?env_id=${envId}`,
      method: 'get',
    }),
    destroy: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/app_service_instances/${data.id}/delete`,
      method: 'delete',
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: format({ id: 'ApplicationName' }) },
    { name: 'code', type: 'string', label: format({ id: 'ApplicationNumber' }) },
    { name: 'commandVersion', type: 'string', label: format({ id: 'ChartVersion' }) },
    { name: 'appServiceName', type: 'string', label: format({ id: 'ChartSource' }) },
    { name: 'chartSource', type: 'string' },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: format({ id: 'ApplicationName' }) },
  ],
});
