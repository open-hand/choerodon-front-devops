import { DataSetProps } from '@/interface';
import DeployConfigApis from '../apis';

export default (projectId: number): DataSetProps => ({
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: {
      url: DeployConfigApis.getAppHasVersion(projectId),
      method: 'get',
    },
  },
});
