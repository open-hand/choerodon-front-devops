import { DataSet, DataSetProps, FieldType } from '@/interface';
import DeploymentApi from '@/routes/deployment/apis';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  serviceDs: DataSet,
  random: number,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
  serviceDs,
  random,
}: FormProps): DataSetProps => ({
  autoCreate: true,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  children: { hzeroService: serviceDs },
  fields: [
    {
      name: 'environmentId',
      textField: 'name',
      valueField: 'id',
      label: formatMessage({ id: 'environment' }),
      required: true,
      lookupAxiosConfig: () => ({
        url: DeploymentApi.getEnvList(projectId),
        params: { random },
        method: 'get',
      }),
    },
    {
      name: 'appVersionId',
      label: formatMessage({ id: `${intlPrefix}.version` }),
      textField: 'name',
      valueField: 'id',
      required: true,
    },
  ],
});
