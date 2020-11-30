import JSONBigint from 'json-bigint';
import isEmpty from 'lodash/isEmpty';

export default (projectId, mathRandom) => ({
  autoCreate: true,
  fields: [{
    name: 'pageSize',
    type: 'number',
    defaultValue: 20,
  }, {
    name: 'appServiceId',
    type: 'string',
    label: '关联应用服务',
    required: true,
    textField: 'appServiceName',
    valueField: 'appServiceId',
    lookupAxiosConfig: (data) => ({
      method: 'post',
      url: `/devops/v1/projects/${projectId}/app_service/page_app_services_without_ci?page=0&size=20&random=${mathRandom}`,
      data: {
        param: [],
        searchParam: {
          name: data.params.appServiceName || '',
        },
      },
      transformResponse: (res) => {
        let newRes;
        try {
          newRes = JSONBigint.parse(res);
          // if (data.params.appServiceName) {
          //   createUseStore.setSearchAppServiceData(newRes);
          // }
          if (newRes.length % 20 === 0 && newRes.length !== 0) {
            newRes.push({
              appServiceId: 'more',
              appServiceName: '加载更多',
            });
          }
          return newRes;
        } catch (e) {
          return res;
        }
      },
    }),
  }],
});
