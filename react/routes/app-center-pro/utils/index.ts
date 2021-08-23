// 判断是部署组还是 chart包， 这里前端自定义命名
// 后端判断逻辑是 -- 1. 如果当前是容器部署也就是env，并且rdupmType === 'chart'则是chart包
// 2. 如果当前是容器部署，但是rdupmType !== 'chart',也就是说等于其他值，则是部署组
// 3. 否者就是 jar包，主机的

import { CHART_CATERGORY, DEPLOY_CATERGORY, HOST_CATERGORY } from '../stores/CONST';

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
  } else {
    name = 'jar包';
    code = HOST_CATERGORY;
  }
  return {
    name, code,
  };
};

export {
  getAppCategories,
};
