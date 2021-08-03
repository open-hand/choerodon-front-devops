import { DataSet, DataSetProps, FieldType } from '@/interface';
import DeploymentApi from '@/routes/deployment/apis';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  serviceDs: DataSet,
  typeDs: DataSet,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
  serviceDs,
  typeDs,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  children: { hzeroService: serviceDs },
  fields: [
    {
      name: 'appType',
      textField: 'text',
      valueField: 'value',
      label: formatMessage({ id: `${intlPrefix}.type` }),
      options: typeDs,
    },
    {
      name: 'environmentName',
      label: formatMessage({ id: 'environment' }),
      required: true,
    },
    {
      name: 'environmentId',
      required: true,
    },
    {
      name: 'appVersionName',
      label: formatMessage({ id: `${intlPrefix}.version` }),
      required: true,
    },
    {
      name: 'appVersionId',
      required: true,
    },
  ],
});
