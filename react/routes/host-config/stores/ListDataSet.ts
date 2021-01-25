/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import apis from '../apis';

interface ListProps {
  projectId: number,
  showTestTab: boolean,
  mainStore:any,
}

export default ({ projectId, showTestTab, mainStore }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 10,
  transport: {
    read: ({ data, dataSet }) => {
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
        transformResponse(res) {
          try {
            const mainData = JSON.parse(res);
            if (mainData && mainData.failed) {
              return mainData;
            }
            let newData = [...mainData.content];
            if (mainData.number > 0 && dataSet) {
              newData = [...dataSet.toData(), ...mainData.content];
            }
            if (dataSet) {
              // eslint-disable-next-line no-param-reassign
              dataSet.pageSize *= (mainData.number + 1);
            }
            mainStore.setListHasMore(
              mainData.totalElements > 0 && (mainData.number + 1) < mainData.totalPages,
            );

            return newData;
          } catch (error) {
            return error;
          }
        },
      };
    },
  },
});
