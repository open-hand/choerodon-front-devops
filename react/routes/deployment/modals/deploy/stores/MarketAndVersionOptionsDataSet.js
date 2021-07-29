export default ((projectId) => ({
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: `market/v1/projects/${projectId}/deploy/application`,
      method: 'get',
    },
  },
  // fields: [
  //   { name: 'marketAppName', type: 'string', group: 0 },
  // ],
  // tableDs.setQueryParameter('env_id', envId);
}));
