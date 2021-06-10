import { DataSetProps, DataSet, FieldIgnore } from '@/interface';
import WorkloadApis from '@/routes/resource/apis/WorkloadApis';

interface FormProps {
  intlPrefix: string,
  formatMessage(arg0: object): string,
  projectId: number,
  envId: string,
  workloadId?: string,
  createTypeDs: DataSet,
  envName: string,
}

export default ({
  projectId, envId, workloadId, formatMessage, intlPrefix, createTypeDs, envName,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  transport: {
    read: {
      url: workloadId ? WorkloadApis.getWorkloadDetail(projectId, workloadId) : '',
      method: 'get',
    },
    submit: ({ data: [data] }: any) => {
      const formData = new FormData();
      formData.append('envId', envId);
      if (data.type === 'paste') {
        formData.append('content', data.value);
      } else {
        formData.append('contentFile', data.file);
      }
      if (workloadId) {
        formData.append('operateType', 'update');
        formData.append('resourceId', workloadId);
      } else {
        formData.append('operateType', 'create');
      }
      return ({
        url: WorkloadApis.createWorkload(projectId),
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
  fields: [{
    name: 'type',
    label: formatMessage({ id: `${intlPrefix}.workload.create.type` }),
    options: createTypeDs,
    textField: 'text',
    valueField: 'value',
    defaultValue: 'paste',
  }, {
    name: 'envName',
    label: formatMessage({ id: 'environment' }),
    defaultValue: envName,
    ignore: 'always' as FieldIgnore,
  }],
  events: {
    load: ({ dataSet }: { dataSet: DataSet }) => {
      const record = dataSet.current;
      record?.init('type', 'paste');
    },
  },
});
