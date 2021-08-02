import { DataSet, DataSetProps, FieldType } from '@/interface';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  serviceDs: DataSet,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
  serviceDs,
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
      // options: envOptionsDs,
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
