/* eslint-disable max-len */
// 判断是部署组还是 chart包， 这里前端自定义命名
// 后端判断逻辑是 -- 1. 如果当前是容器部署也就是env，并且rdupmType === 'chart'则是chart包
// 2. 如果当前是容器部署，但是rdupmType !== 'chart',也就是说等于其他值，则是部署组
// 3. 否者就是 jar包，主机的

import {
  CHART_CATERGORY,
  DEPLOY_CATERGORY,
  ENV_TAB,
  HOST_CATERGORY,
  OTHER_CATERGORY,
  HOST_TAB,
  isHostGroup,
  MIDDLWARE_CATERGORY,
  isMarketGroup,
  isServiceGroup,
  IS_HOST,
  IS_MARKET,
  IS_SERVICE,
  DOCKER_CATEGORY,
  DOCKER_COMPOSE_CATEGORY,
} from '../stores/CONST';

// Chart包，部署组，还是jar包
const getAppCategories = (rdupmType:string, deployType = 'env') => {
  let name;
  let code;
  if (deployType === 'env') {
    if (rdupmType === 'chart') {
      name = 'Chart包';
      code = CHART_CATERGORY;
    } else {
      name = '部署组';
      code = DEPLOY_CATERGORY;
    }
  } else if (rdupmType === 'jar') {
    name = 'jar包';
    code = HOST_CATERGORY;
  } else if (rdupmType === 'docker') {
    name = 'Docker镜像';
    code = DOCKER_CATEGORY;
  } else if (rdupmType === 'middleware') {
    name = '中间件';
    code = MIDDLWARE_CATERGORY;
  } else if (rdupmType === 'docker_compose') {
    name = 'Docker Compose';
    code = DOCKER_COMPOSE_CATEGORY;
  } else {
    name = '其它制品';
    code = OTHER_CATERGORY;
  }
  return {
    name, code,
  };
};

// 制品来源分未3大类
const getChartSourceGroup = (chartSource:string, deployType = 'env') => {
  if (deployType === ENV_TAB && !chartSource) return IS_MARKET;
  if (deployType === HOST_TAB) return IS_HOST;
  if (isMarketGroup.includes(chartSource)) {
    return IS_MARKET;
  }
  if (isServiceGroup.includes(chartSource)) {
    return IS_SERVICE;
  }
  return 'unknown_group';
};

export {
  getChartSourceGroup,
  getAppCategories,
};
