export default (projectId:string, networkId:string) => ({
  paging: false,
  transport: {
    read: {
      url: `/devops/v1/projects/${projectId}/service/${networkId}`,
      method: 'get',
    },
  },
});
