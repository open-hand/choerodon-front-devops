import AppCenterApi from '@/routes/app-center/apis';
import { DataSetProps } from '@/interface';

export default (projectId: number): DataSetProps => ({
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: AppCenterApi.getAppHasVersion(projectId),
      method: 'get',
    },
  },
});
