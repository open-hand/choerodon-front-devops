import {
  RdupmAlienApiConfig,
  appServiceApiConfig,
} from '@choerodon/master';

const defaultTargetImageRepoDataSet = (appServiceId: any) => ({
  autoQuery: true,
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
