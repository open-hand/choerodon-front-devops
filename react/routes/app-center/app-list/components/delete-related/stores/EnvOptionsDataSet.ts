import { DataSetProps } from '@/interface';
import AppCenterApis from '@/routes/app-center/apis';

interface EnvOptionsProps {
  projectId: number,
  appServiceId: string,
}

export default ({ projectId, appServiceId }: EnvOptionsProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: AppCenterApis.getRelatedEnvList(projectId, appServiceId),
      method: 'get',
    },
  },
});
