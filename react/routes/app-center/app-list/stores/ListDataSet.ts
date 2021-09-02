import { DataSetProps, DataSet } from '@/interface';
import AppCenterApis from '@/routes/app-center/apis';

interface ListProps {
  projectId: number,
  searchDs: DataSet,
}

export default ({ projectId, searchDs }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 6,
  queryDataSet: searchDs,
  transport: {
    read: ({ data }: { data: { typeKey: string } }) => {
      const { typeKey } = data || {};
      return ({
        url: typeKey === 'env' ? AppCenterApis.getAppList(projectId) : AppCenterApis.getAppListByHost(projectId),
        method: 'get',
      });
    },
  },
});
