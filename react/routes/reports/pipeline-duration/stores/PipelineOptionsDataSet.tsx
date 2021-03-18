import { DataSetProps } from '@/interface';
import ReportsApis from '@/routes/reports/apis';

interface OptionProps {
  projectId: number,
}

export default ({ projectId }: OptionProps): DataSetProps => ({
  autoQuery: false,
  paging: false,
  transport: {
    read: {
      url: ReportsApis.getAllPipeline(projectId),
      method: 'get',
    },
  },
});
