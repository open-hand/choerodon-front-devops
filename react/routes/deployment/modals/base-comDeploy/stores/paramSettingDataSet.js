import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
// eslint-disable-next-line import/no-cycle
import { mapping as baseMapping } from './baseDeployDataSet';

const mapping = {
  params: {
    name: 'paramName',
    type: 'string',
    label: '参数',
  },
  defaultParams: {
    name: 'paramDefaultValue',
    type: 'string',
    label: '参数默认值',
  },
  paramsScope: {
    name: 'paramRange',
    type: 'string',
    label: '参数范围',
  },
  paramsRunnigValue: {
    name: 'paramsRunningValue',
    type: 'string',
    label: '参数运行值',
  },
  tooltip: {
    name: 'paramExplanation',
    type: 'string',
  },
};

export { mapping };

export default (BaseDeployDataSet) => ({
  paging: false,
  selection: false,
  autoQuery: true,
  // autoCreate: true,
  transport: {
    read: (data) => {
      let middleware = BaseDeployDataSet.current.get(baseMapping.middleware.name);
      let deployWay = BaseDeployDataSet.current.get(baseMapping.deployWay.name);
      let deployMode = BaseDeployDataSet.current.get(baseMapping.deployMode.name);
      if (data && data.data && data.queryParams) {
        middleware = data.data.queryParams.middleware;
        deployWay = data.data.queryParams.deployWay;
        deployMode = data.data.queryParams.deployMode;
      }
      if (middleware && deployWay && deployMode) {
        return ({
          url: BaseComDeployApis.getParamsSettingApi(
            middleware,
            deployWay,
            deployMode,
          ),
          method: 'get',
          transformResponse: (res) => {
            let newRes = res;
            try {
              newRes = JSON.parse(newRes);
              newRes.middlewareConfigVOS.forEach((item) => {
                // eslint-disable-next-line no-param-reassign
                item.paramsRunningValue = item.paramDefaultValue;
              });
              return newRes.middlewareConfigVOS;
            } catch (e) {
              return newRes.middlewareConfigVOS;
            }
          },
        });
      }
      return undefined;
    },
  },
  fields: Object.keys(mapping).map((key) => mapping[key]),
});
