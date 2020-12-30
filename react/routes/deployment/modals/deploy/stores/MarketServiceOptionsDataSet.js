export default ((projectId) => ({
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => ({
      url: `market/v1/projects/${projectId}/deploy/application/version/${data.marketVersionId}`,
      method: 'get',
    }),
  },
}));
