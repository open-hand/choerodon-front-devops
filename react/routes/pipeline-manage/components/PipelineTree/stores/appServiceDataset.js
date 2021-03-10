import JSONBigint from 'json-bigint';
import get from 'lodash/get';

/* eslint-disable import/no-anonymous-default-export */
export default (projectId) => ({
  autoQuery: false,
  selection: 'single',
  paging: false,
  pageSize: 20,
  transport: {
    read: ({ data }) => ({
      method: 'post',
      url: `/devops/v1/projects/${projectId}/app_service/page_app_services_without_ci?page=0&size=20`,
      data: {
        param: [],
        searchParam: {
          name: get(data.params, 'appServiceName') || '',
        },
      },
      transformResponse: (res) => {
        let newRes;
        try {
          newRes = JSONBigint.parse(res);
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
  },
});
