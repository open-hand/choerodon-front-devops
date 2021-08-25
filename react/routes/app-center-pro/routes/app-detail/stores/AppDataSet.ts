import { ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

/* eslint-disable import/no-anonymous-default-export */
export default ({ appId, projectId, deployType = ENV_TAB }:{
  appId:string,
  projectId:string
  deployType: typeof ENV_TAB | typeof HOST_TAB
}):any => ({
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: {
      method: 'get',
      url: deployType === ENV_TAB ? `/devops/v1/projects/${projectId}/deploy_app_center/${appId}/env_detail` : `/devops/v1/projects/${projectId}/hosts/apps/${appId}`,
    },
  },
});
