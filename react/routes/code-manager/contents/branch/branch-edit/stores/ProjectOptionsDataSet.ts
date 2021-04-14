import { DataSetProps, DataSetSelection } from '@/interface';
import CodeManagerApis from '@/routes/code-manager/apis';

interface OptionProps {
  organizationId: string,
  userId: string,
}

export default ({ organizationId, userId }: OptionProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: 'single' as DataSetSelection,
  pageSize: 15,
  transport: {
    read: {
      url: CodeManagerApis.loadProjectData(organizationId, userId),
      method: 'get',
    },
  },
});
