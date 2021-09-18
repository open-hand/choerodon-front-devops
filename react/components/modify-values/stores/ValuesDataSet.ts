/* eslint-disable max-len */
const ValuesDataset = ({
  projectId,
  isMarket,
  instanceId,
  appServiceVersionId,
  isMiddleware,
}:{
  projectId:string,
  appServiceVersionId:string,
  isMarket:boolean,
  instanceId:string
  isMiddleware:boolean,
}) => ({
  autoQuery: true,
  transport: {
    read: () => ({
      method: 'get',
      url: (isMarket || isMiddleware)
        ? `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/upgrade_value?market_deploy_object_id=${appServiceVersionId}`
        : `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/appServiceVersion/${appServiceVersionId}/upgrade_value`,
    }),
  },
});

export default ValuesDataset;
