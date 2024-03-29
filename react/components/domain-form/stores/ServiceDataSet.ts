/* eslint-disable import/no-anonymous-default-export */
export default ({ projectId, envId, appServiceId }:any):any => ({
  autoCreate: false,
  autoQuery: false,
  selection: 'single',
  paging: false,
  transport: {
    read: {
      url: `/devops/v1/projects/${projectId}/service/list_by_env?env_id=${envId}${appServiceId ? `&app_service_id=${appServiceId}` : ''}`,
      method: 'get',
    },
  },
});
