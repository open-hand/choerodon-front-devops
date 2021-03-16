import { DataSetProps, DataSetSelection } from '@/interface';
import AppServiceApis from '@/routes/app-service/apis';

export default (projectId: number, type: string): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  selection: 'single' as DataSetSelection,
  transport: {
    read: {
      url: AppServiceApis.getTemplateList(projectId, type),
      method: 'get',
    },
  },
});
