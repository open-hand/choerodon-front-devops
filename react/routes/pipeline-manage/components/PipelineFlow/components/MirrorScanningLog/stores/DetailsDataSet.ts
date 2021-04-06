/* eslint-disable import/no-anonymous-default-export */
export default (({
  projectId,
  gitlabPipelineId,
}:any):any => ({
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: () => ({
      // url: '/devops/v1/projects/1/image/info/1/1',
      url: `/devops/v1/projects/${projectId}/image/info/${gitlabPipelineId}`,
      method: 'get',
    }),
  },
}));
