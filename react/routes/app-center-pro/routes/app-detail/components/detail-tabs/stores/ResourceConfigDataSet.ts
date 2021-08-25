const ResourceConfigDs = ({
  projectId,
  appCenterId,
}:{
  projectId:string
  appCenterId:string,
}) => ({
  autoQuery: false,
  pageSize: 10,
  transport: {
    read: {
      url: `devops/v1/projects/${projectId}/deploy_app_center/${appCenterId}/env_chart_service`,
    },
  },
});

export default ResourceConfigDs;
