// deployType
const ENV_TAB = 'env';

const HOST_TAB = 'host';

const DEPLOY_TYPE = {
  ENV_TAB,
  HOST_TAB,
} as const;

// （部署对象整合字段，只是前端用到了）
const CHART_CATERGORY = 'chart_group'; // Chart包标识

const DEPLOY_CATERGORY = 'deploy_group'; // 部署组标识

const HOST_CATERGORY = 'host_group'; // jar包标识
const OTHER_CATERGORY = 'other_group'; // 其他制品标识
const MIDDLWARE_CATERGORY = 'middleware_group';

// chartSource
const CHART_MARKET = 'market'; // 市场
const CHART_HZERO = 'hzero'; // hzero
const CHART_MIDDLEWARE = 'middleware'; // 中间件

const CHART_SHARE = 'share'; // 共享
const CHART_NORMAL = 'normal'; // 应用服务来自本项目
const CHART_REPO = 'currentProject'; // 项目制品库

const CHART_UPLOAD = 'upload';

const CHART_HOST = 'all'; // 主机的无chartsource，就是all

const IS_MARKET = 'market_group';
const IS_SERVICE = 'project_service_group';
const IS_HOST = 'all_group';

const isMarketGroup = [CHART_MARKET, CHART_HZERO, CHART_MIDDLEWARE];
const isServiceGroup = [CHART_SHARE, CHART_NORMAL, CHART_REPO];
const isHostGroup = [CHART_HOST];

// app status
const APP_STATUS = {
  ACTIVE: 'active',
  STOP: 'stopped',
  OPERATING: 'operating',
  SUCCESS: 'success',
  FAILED: 'failed',
  RUNNING: 'running',
};

// 操作类型
/**
     * 创建应用
     */
const CREATE_APP = 'create_app';
/**
  * hzero快速部署
  */
const HZERO = 'hzero';
/**
  * 基础组件
  */
const BASE_COMPONENT = 'base_component';
/**
  * 批量部署
  */
const BATCH_DEPLOY = 'batch_deploy';
/**
  * 流水先部署
  */
const PIPELINE_DEPLOY = 'pipeline_deploy';

const APP_OPERATION = {
  CREATE_APP,
  HZERO,
  BASE_COMPONENT,
  BATCH_DEPLOY,
  PIPELINE_DEPLOY,
};

export {
  ENV_TAB,
  HOST_TAB,
  DEPLOY_TYPE,
  CHART_CATERGORY,
  DEPLOY_CATERGORY,
  MIDDLWARE_CATERGORY,
  HOST_CATERGORY,
  OTHER_CATERGORY,
  CHART_MARKET,
  CHART_SHARE,
  CHART_HZERO,
  CHART_UPLOAD,
  CHART_MIDDLEWARE,
  CHART_NORMAL,
  CHART_HOST,
  CHART_REPO,
  IS_MARKET,
  IS_SERVICE,
  IS_HOST,
  isServiceGroup,
  isHostGroup,
  isMarketGroup,
  APP_STATUS,

  CREATE_APP,
  HZERO,
  BASE_COMPONENT,
  BATCH_DEPLOY,
  PIPELINE_DEPLOY,
  APP_OPERATION,
};
