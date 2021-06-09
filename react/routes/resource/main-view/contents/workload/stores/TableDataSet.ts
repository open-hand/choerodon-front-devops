import { DataSetProps, FieldType, DataSet } from '@/interface';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';
import getTablePostData from '@/utils/getTablePostData';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object): string,
  projectId: number,
  resourceDs: DataSet,
}

export default ({
  intlPrefix, formatMessage, projectId, resourceDs,
}: TableProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }) => {
      const postData = getTablePostData(data);
      const { envId } = data || {};
      return ({
        url: WorkloadApis.getTableData(projectId, envId),
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }) => ({
      url: '',
      method: 'delete',
    }),
  },
  fields: [{
    name: 'name',
    label: formatMessage({ id: 'name' }),
  }, {
    name: 'pod',
    label: 'Pod',
  }, {
    name: 'label',
    label: formatMessage({ id: 'label' }),
  }, {
    name: 'port',
    label: formatMessage({ id: 'port' }),
  }, {
    name: 'lastUpdateDate',
    type: 'string' as FieldType,
    label: formatMessage({ id: 'updateDate' }),
  }, {
    name: 'resource',
    label: formatMessage(({ id: `${intlPrefix}.workload.resource` })),
  }],
  queryFields: [{
    name: 'name',
    label: formatMessage({ id: 'name' }),
    options: resourceDs,
    textField: 'text',
    valueField: 'value',
  }],
});
