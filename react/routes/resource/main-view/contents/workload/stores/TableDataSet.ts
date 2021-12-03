import { DataSetProps, FieldType, DataSet } from '@/interface';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object): string,
  projectId: number,
  sourceDs: DataSet,
  format: any,
}

export default ({
  intlPrefix, formatMessage, projectId, sourceDs, format,
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
  },
  {
    name: 'sourceType',
    label: format({ id: 'Type' }),
  },
  {
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
    label: format({ id: 'UpdateTime' }),
  }, {
    name: 'source',
    label: format({ id: 'Source' }),
  }, {
    name: 'schedule',
    label: format({ id: 'Plan' }),
  }, {
    name: 'active',
    label: format({ id: 'Active' }),
  }, {
    name: 'suspend',
    label: format({ id: 'SuspendorNot' }),
  }, {
    name: 'lastScheduleTime',
    label: format({ id: 'LastScheduledTime' }),
  }, {
    name: 'creationTimestamp',
    label: format({ id: 'CreationTime' }),
  }],
  queryFields: [{
    name: 'name',
    label: formatMessage({ id: 'name' }),
  }, {
    name: 'from_instance',
    label: format({ id: 'Source' }),
    options: sourceDs,
    textField: 'text',
    valueField: 'value',
  }],
});
