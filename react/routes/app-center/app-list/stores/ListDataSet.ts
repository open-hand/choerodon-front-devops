import { DataSetProps, DataSet } from '@/interface';
import AppCenterApis from '@/routes/app-center/apis';

interface ListProps {
  projectId: number,
  defaultTabKey: string,
  searchDs: DataSet,
}

export default ({ projectId, defaultTabKey, searchDs }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: true,
  pageSize: 6,
  queryDataSet: searchDs,
  transport: {
    read: ({ data, dataSet }) => {
      const { type } = data || {};
      const queryDataSet = dataSet?.queryDataSet;
      const searchRecord = queryDataSet?.get(0);
      const params = searchRecord?.get('params');
      const env = searchRecord?.get('env');
      const newType = type || defaultTabKey;
      return {
        url: AppCenterApis.getAppList(projectId),
        method: 'post',
      };
    },
  },
});
