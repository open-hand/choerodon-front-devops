const ResourceConfigDs = ({
  projectId,
  appCenterId,
}:{
  projectId:string
  appCenterId:string,
}) => ({
  autoQuery: false,
  // data: [
  //   {
  //     id: 1,
  //     name: 2121,
  //     children: [],
  //   },
  //   {
  //     id: 2,
  //     name: 2121,
  //     children: [
  //       {
  //         id: 3,
  //       },
  //       {
  //         id: 4,
  //       },
  //     ],
  //   },

  // ],
  transport: {
    read: {
      url: `devops/v1/projects/${projectId}/deploy_app_center/${appCenterId}/env_chart_service`,
    },
  },
});

export default ResourceConfigDs;
