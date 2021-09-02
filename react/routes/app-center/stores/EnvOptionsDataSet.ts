import { DataSetProps } from '@/interface';
import AppCenterApis from '@/routes/app-center/apis';

interface EnvOptionsProps {
  projectId: number,
}

export default ({ projectId }: EnvOptionsProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: AppCenterApis.getEnvList(projectId),
      method: 'get',
    },
  },
});
