import { DataSetProps, DataSet } from '@/interface';
import AppCenterApis from '@/routes/app-center/apis';

interface ListProps {
  projectId: number,
  searchDs: DataSet,
}

export default ({ projectId, searchDs }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: true,
  pageSize: 6,
  queryDataSet: searchDs,
  transport: {
    read: {
      url: AppCenterApis.getAppList(projectId),
      method: 'get',
    },
  },
});
