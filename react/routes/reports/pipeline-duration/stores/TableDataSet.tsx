import ReportsApis from '@/routes/reports/apis';
import { DataSetProps } from '@/interface';

interface ChartProps {
  projectId: number,
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
}

export default ({
  projectId, formatMessage, intlPrefix,
}: ChartProps): DataSetProps => ({
  selection: false,
  autoQuery: false,
  paging: true,
  transport: {
    read: ({ data }) => {
      const { pipelineIds, startTime, endTime } = data || {};
      return ({
        url: ReportsApis.getPipelineDurationTable(projectId, startTime, endTime),
        method: 'post',
        data: pipelineIds || [],
      });
    },
  },
  fields: [
    {
      name: 'status',
      label: formatMessage({ id: 'status' }),
    },
    {
      name: 'viewId',
      label: formatMessage({ id: `${intlPrefix}.number` }),
    },
    {
      name: 'pipelineName',
      label: formatMessage({ id: `${intlPrefix}.name` }),
    },
    {
      name: 'stageRecordVOS',
      label: formatMessage({ id: `${intlPrefix}.stage` }),
    },
    {
      name: 'appServiceName',
      label: formatMessage({ id: `${intlPrefix}.appService` }),
    },
    {
      name: 'createdDate',
      label: formatMessage({ id: `${intlPrefix}.startTime` }),
    },
    {
      name: 'durationSeconds',
      label: formatMessage({ id: `${intlPrefix}.execute` }),
    },
    {
      name: 'iamUserDTO',
      label: formatMessage({ id: `${intlPrefix}.trigger` }),
    },
  ],
});
