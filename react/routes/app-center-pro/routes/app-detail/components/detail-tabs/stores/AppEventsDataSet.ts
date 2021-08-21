/* eslint-disable import/no-anonymous-default-export */
export default ({
  appCenterId,
  projectId,
}:any):any => ({
  autoQuery: false,
  selection: false,
  paging: false,
  dataKey: null,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'code', type: 'string' },
    { name: 'podRunningCount', type: 'number' },
    { name: 'podCount', type: 'number' },
    { name: 'appServiceId', type: 'string' },
    { name: 'appServiceVersionId', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'commandVersion', type: 'string' },
    { name: 'commandVersionId', type: 'string' },
    { name: 'connect', type: 'bool' },
    { name: 'error', type: 'string' },
    { name: 'versionName', type: 'string' },
  ],
  transport: {
    read: appCenterId ? {
      method: 'get',
      url: `/devops/v1/projects/${projectId}/deploy_app_center/${appCenterId}/env_event`,
    } : {},
  },
});
