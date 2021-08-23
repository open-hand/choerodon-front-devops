const ENV_TAB = 'env';

const HOST_TAB = 'host';

const DEPLOY_TYPE = {
  ENV_TAB,
  HOST_TAB,
} as const;

const CHART_CATERGORY = 'chart_group'; // Chart包标识

const DEPLOY_CATERGORY = 'deploy_group'; // 部署组标识

const HOST_CATERGORY = 'host_group'; // jar包标识

export {
  ENV_TAB,
  HOST_TAB,
  DEPLOY_TYPE,
  CHART_CATERGORY,
  DEPLOY_CATERGORY,
  HOST_CATERGORY,
};
