import { DataSetProps } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';

interface SearchProps {
  projectId: number,
  appServiceId: string,
  appServiceType: 'project' | 'share' | 'market',
}

export default ({ projectId, appServiceId, appServiceType }: SearchProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: appServiceType === 'market'
        ? AppCenterApi.getMarketAppServiceDetail(projectId, appServiceId)
        : AppCenterApi.getAppServiceDetail(projectId, appServiceId),
      method: 'get',
    },
  },
});
