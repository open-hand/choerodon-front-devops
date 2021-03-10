import ReportsApis from '@/routes/reports/apis';
import { DataSetProps } from '@/interface';

interface ChartProps {
  projectId: number,
}

export default ({ projectId }: ChartProps): DataSetProps => ({
  paging: false,
  autoQuery: false,
  transport: {
    read: ({ data }) => {
      const { pipelineIds, startTime, endTime } = data || {};
      return ({
        url: ReportsApis.getPipelineDurationChart(projectId, startTime, endTime),
        method: 'post',
        data: pipelineIds || [],
      });
    },
  },
});
