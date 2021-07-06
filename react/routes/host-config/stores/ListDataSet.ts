/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import apis from '../apis';

interface ListProps {
  projectId: number,
  defaultTabKey: string,
  tabKey: {
    DEPLOY_TAB: string,
    TEST_TAB: string,
  },
}

export default ({ projectId, defaultTabKey, tabKey: { DEPLOY_TAB } }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 10,
  transport: {
    read: ({ data, params: pageParams }) => {
      const { type, params, status } = data;
      const newType = type || defaultTabKey;
      const newParams = newType === DEPLOY_TAB ? {
        search_param: params,
        host_status: status,
        ...pageParams || {},
      } : pageParams;
      return {
        url: apis.getLoadHostsDetailsUrl(projectId, newType),
        method: 'post',
        params: newParams,
        data: newType === DEPLOY_TAB ? null : {
          searchParam: {
            type: newType,
            status,
          },
          params: params ? [params] : [],
        },
      };
    },
  },
});
