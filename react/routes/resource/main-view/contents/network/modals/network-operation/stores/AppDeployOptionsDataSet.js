export default (projectId, envId, formatMessage) => ({
  autoQuery: true,
  transport: {
    read: {
      method: 'get',
      url: `/devops/v1/projects/${projectId}/deploy_app_center/deployment?env_id=${envId}`,
    },
  },
});
