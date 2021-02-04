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
      const newType = type || (showTestTab ? 'distribute_test' : 'deploy');
      return {
        url: apis.getLoadHostsDetailsUrl(projectId, newType),
        method: 'post',
        data: {
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
