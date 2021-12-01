import { organizationsApiConfig } from '@choerodon/master';
import { DataSetProps, DataSetSelection } from '@/interface';

interface OptionProps {
  organizationId: string,
  userId: string,
  projectId: string,
}

export default ({ organizationId, userId, projectId }: OptionProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: 'single' as DataSetSelection,
  pageSize: 15,
  transport: {
    read: {
      url: organizationsApiConfig.loadProjectData(userId, projectId).url,
      method: 'get',
    },
  },
});
