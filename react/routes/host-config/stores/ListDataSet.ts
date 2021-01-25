/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import apis from '../apis';

interface ListProps {
  projectId: number,
  showTestTab: boolean,
}

export default ({ projectId, showTestTab }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const { type, params, status } = data;
      return {
        url: apis.getLoadHostsDetailsUrl(projectId, type),
        method: 'post',
        data: {
          searchParam: {
            type: type || (showTestTab ? 'distribute_test' : 'deploy'),
            status,
          },
          params: params ? [params] : [],
        },
      };
    },
  },
});
