/* eslint-disable import/no-anonymous-default-export */
export default ({ appId }:any):any => ({
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: {
      method: 'get',
      url: '/devops/v1/projects/159349538124681216/deploy_app_center/2/env_detail',
    },
  },
});
