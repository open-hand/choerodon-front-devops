import { DataSetProps } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';
import { AppServiceType } from './index';

interface SearchProps {
  projectId: number,
  appServiceId: string,
  appServiceType: AppServiceType,
}

export default ({ projectId, appServiceId, appServiceType }: SearchProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: appServiceType === 'market' || appServiceType === 'hzero'
        ? AppCenterApi.getMarketAppServiceDetail(projectId, appServiceId)
        : AppCenterApi.getAppServiceDetail(projectId, appServiceId),
      method: 'get',
    },
  },
});
