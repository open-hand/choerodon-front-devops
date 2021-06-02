import { DataSetProps, DataSetSelection } from '@/interface';
import CodeManagerApis from '@/routes/code-manager/apis';

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
      url: CodeManagerApis.loadProjectData(organizationId, userId, projectId),
      method: 'get',
    },
  },
});
