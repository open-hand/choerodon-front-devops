import { DataSetProps, FieldType, DataSet } from '@/interface';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object): string,
  projectId: number,
  sourceDs: DataSet,
}

export default ({
  intlPrefix, formatMessage, projectId, sourceDs,
}: TableProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const { type } = data || {};
      return ({
        url: WorkloadApis.getTableData(projectId, type),
        method: 'get',
      });
    },
    destroy: ({ data: [data] }) => ({
      url: WorkloadApis.deleteWorkload(projectId, data.urlType),
      method: 'delete',
      params: {
        id: data.id,
      },
    }),
  },
  fields: [{
    name: 'name',
    label: formatMessage({ id: 'name' }),
  }, {
    name: 'pod',
    label: 'Pod',
  }, {
    name: 'labels',
    label: formatMessage({ id: 'label' }),
  }, {
    name: 'ports',
    label: formatMessage({ id: 'port' }),
  }, {
    name: 'age',
    type: 'string' as FieldType,
    label: formatMessage({ id: 'updateDate' }),
  }, {
    name: 'source',
    label: formatMessage(({ id: `${intlPrefix}.workload.source` })),
  }, {
    name: 'schedule',
    label: formatMessage(({ id: `${intlPrefix}.workload.plan` })),
  }, {
    name: 'active',
    label: formatMessage(({ id: `${intlPrefix}.workload.active` })),
  }, {
    name: 'suspend',
    label: formatMessage(({ id: `${intlPrefix}.workload.suspend` })),
  }, {
    name: 'lastScheduleTime',
    label: formatMessage(({ id: `${intlPrefix}.workload.lastScheduleTime` })),
  }, {
    name: 'creationTimestamp',
    label: formatMessage(({ id: 'createDate' })),
  }],
  queryFields: [{
    name: 'name',
    label: formatMessage({ id: 'name' }),
  }, {
    name: 'from_instance',
    label: formatMessage(({ id: `${intlPrefix}.workload.source` })),
    options: sourceDs,
    textField: 'text',
    valueField: 'value',
  }],
});
