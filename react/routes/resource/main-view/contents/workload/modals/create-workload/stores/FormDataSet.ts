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
  workloadType: string,
  urlType: string,
}

export default ({
  projectId, envId, workloadId, formatMessage, intlPrefix,
  createTypeDs, envName, workloadType, urlType,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  dataKey: 'null',
  transport: {
    read: {
      url: workloadId ? WorkloadApis.getWorkloadDetail(projectId) : '',
      method: 'get',
      params: {
        env_id: envId,
        type: workloadType,
        workload_id: workloadId,
      },
      transformResponse: (response) => {
        try {
          if (response && response.failed) {
            return response;
          }
          return { value: response, type: 'paste' };
        } catch (e) {
          return response;
        }
      },
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
        url: WorkloadApis.createWorkload(projectId, urlType),
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
});
