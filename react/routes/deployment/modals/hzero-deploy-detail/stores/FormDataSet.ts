import { DataSet, DataSetProps, FieldType } from '@/interface';
import { deployRecordApiConfig } from '@/api';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  serviceDs: DataSet,
  typeDs: DataSet,
  recordId: string,
}

export default ({
  formatMessage,
  intlPrefix,
  serviceDs,
  typeDs,
  recordId,
}: FormProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  autoQueryAfterSubmit: false,
  paging: false,
  children: { deployDetailsVOList: serviceDs },
  transport: {
    read: deployRecordApiConfig.loadRecordDetail(recordId),
  },
  fields: [
    {
      name: 'type',
      textField: 'text',
      valueField: 'value',
      label: formatMessage({ id: `${intlPrefix}.type` }),
      options: typeDs,
    },
    {
      name: 'environmentDTO',
      label: formatMessage({ id: 'environment' }),
      required: true,
    },
    {
      name: 'mktAppVersion',
      label: formatMessage({ id: `${intlPrefix}.version` }),
      required: true,
    },
  ],
});
