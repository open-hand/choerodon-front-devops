/* eslint-disable max-len */
import JSONbig from 'json-bigint';
import { deployAppCenterApiConfig, hostApiConfig } from '@/api';
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
    read: ({
      ...deployType === ENV_TAB ? deployAppCenterApiConfig.loadEnvAppDetail(appId) : hostApiConfig.loadHostAppDetail(appId),
      transformResponse: (res: any) => {
        let newRes = res;
        try {
          newRes = JSONbig.parse(newRes);
          return newRes;
        } catch (e) {
          return newRes;
        }
      },
    }),
  },
});
