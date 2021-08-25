/* eslint-disable max-len */
const ValuesDataset = ({
  projectId,
  isMarket,
  instanceId,
  appServiceVersionId,
}:{
  projectId:string,
  appServiceVersionId:string,
  isMarket:boolean,
  instanceId:string
}) => ({
  autoQuery: true,
  transport: {
    read: () => ({
      method: 'get',
      url: isMarket
        ? `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/upgrade_value?market_deploy_object_id=${appServiceVersionId}`
        : `/devops/v1/projects/${projectId}/app_service_instances/${instanceId}/appServiceVersion/${appServiceVersionId}/upgrade_value`,
    }),
  },
});

export default ValuesDataset;
