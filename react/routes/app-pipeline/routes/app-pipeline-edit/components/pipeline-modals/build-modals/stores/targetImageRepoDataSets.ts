import {
  RdupmAlienApiConfig,
  appServiceApiConfig,
} from '@choerodon/master';

const defaultTargetImageRepoDataSet = (appServiceId: any) => ({
  autoQuery: !!appServiceId,
  transport: {
    read: () => ({
      ...appServiceApiConfig.getDockerRepoConfig(appServiceId),
    }),
  },
});

const customTargetImageRepoDataSet = () => ({
  autoQuery: true,
  transport: {
    read: () => ({
      ...RdupmAlienApiConfig.getProjectRepos(),
    }),
  },
});

export {
  defaultTargetImageRepoDataSet,
  customTargetImageRepoDataSet,
};
