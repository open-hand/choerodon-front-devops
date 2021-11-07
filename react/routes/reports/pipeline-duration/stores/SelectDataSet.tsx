import { DataSetProps, DataSet, Record } from '@/interface';
import { Choerodon } from '@choerodon/master';
import isEmpty from 'lodash/isEmpty';

interface SelectProps {
  formatMessage(arg0: object, arg1?: object): string,
  optionsDs: DataSet,
  ReportsStore: any,
  chartDs: DataSet,
  tableDs: DataSet,
}

interface DataSetUpdateEventProps {
  name: string,
  value: any,
  record: Record,
}

export default ({
  optionsDs, ReportsStore, tableDs, chartDs, formatMessage,
}: SelectProps): DataSetProps => {
  async function handleUpdate({
    name, value, record,
  }: DataSetUpdateEventProps) {
    if (name === 'pipelineIds' && isEmpty(value)) {
      return;
    }
    chartDs.setQueryParameter(name, value);
    tableDs.setQueryParameter(name, value);
    if (name === 'pipelineIds' && value.length > 5) {
      const newValue = value.splice(0, 5);
      chartDs.setQueryParameter(name, newValue);
      tableDs.setQueryParameter(name, newValue);
      record.set(name, newValue);
      Choerodon.prompt(formatMessage({ id: 'c7ncd.reports.pipeline.duration.failed' }));
    }
    chartDs.query();
    tableDs.query();
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'pipelineIds',
        textField: 'name',
        valueField: 'id',
        multiple: true,
        options: optionsDs,
        label: '应用流水线',
      },
    ],
    events: {
      create: async ({ record }: { record: Record }) => {
        await optionsDs.query();
        const ps = ['choerodon.code.project.deploy.app-deployment.pipeline.ps.create'];
        if (optionsDs.length) {
          const optionRecord = optionsDs.get(0);
          if (optionRecord && optionRecord.get('id')) {
            const startTime = ReportsStore.getStartTime.format('YYYY-MM-DD HH:mm:ss');
            const endTime = ReportsStore.getEndTime.format('YYYY-MM-DD HH:mm:ss');
            chartDs.setQueryParameter('startTime', startTime);
            chartDs.setQueryParameter('endTime', endTime);
            tableDs.setQueryParameter('startTime', startTime);
            tableDs.setQueryParameter('endTime', endTime);
            record.set('pipelineIds', [optionRecord.get('id')]);
          }
        } else {
          ReportsStore.judgeRole(ps);
        }
      },
      update: handleUpdate,
    },
  });
};
