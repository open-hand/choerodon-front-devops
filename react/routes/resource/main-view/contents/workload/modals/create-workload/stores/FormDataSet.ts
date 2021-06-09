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
    create: ({ data: [data] }: any) => ({
      url: WorkloadApis.createWorkload(projectId, envId),
      method: 'post',
    }),
    update: ({ data: [data] }: any) => ({
      url: workloadId ? WorkloadApis.updateWorkload(projectId, workloadId) : '',
      method: 'put',
    }),
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
});
