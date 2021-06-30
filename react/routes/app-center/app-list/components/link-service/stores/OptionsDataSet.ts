import { DataSetProps } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';

interface OptionProps {
  projectId: number,
}

export default ({ projectId }: OptionProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  transport: {
    read: {
      url: AppCenterApi.getNonRelatedAppService(projectId),
      method: 'get',
    },
  },
});
