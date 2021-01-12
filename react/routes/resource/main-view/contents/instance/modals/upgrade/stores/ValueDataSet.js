export default ({
  projectId, appServiceInstanceId, versionId, isMarket,
}) => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  dataKey: null,
  paging: false,
  transport: {
    read: ({ data }) => ({
      url: isMarket
        ? `/devops/v1/projects/${projectId}/app_service_instances/${appServiceInstanceId}/upgrade_value?market_deploy_object_id=${versionId}`
        : `/devops/v1/projects/${projectId}/app_service_instances/${appServiceInstanceId}/appServiceVersion/${data.versionId || versionId}/upgrade_value`,
      method: 'get',
    }),
  },
  fields: [
    { name: 'yaml', type: 'string' },
  ],
});
