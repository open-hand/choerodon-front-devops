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
      url: `/devops/v1/projects/${projectId}/app_service/page_app_services_without_ci?
      page=0&size=${get(data.params, 'size') || '20'}`,
      data: {
        param: [],
        searchParam: {
          name: get(data.params, 'appServiceName') || '',
        },
      },
      transformResponse: (res) => {
        try {
          const newRes = JSONBigint.parse(res);
          if (newRes.totalPages > newRes.number + 1 && !newRes.empty) {
            newRes.content.push({
              appServiceId: 'more',
              appServiceName: '加载更多',
            });
          }
          return newRes.content;
        } catch (e) {
          return res;
        }
      },
    }),
  },
});
