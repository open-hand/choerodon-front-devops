import { DataSet, DataSetProps, FieldType } from '@/interface';
import { deployRecordApiConfig } from '@/api';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
  serviceDs: DataSet,
  typeDs: DataSet,
  recordId: string,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
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
      textField: 'name',
      valueField: 'id',
      label: formatMessage({ id: 'environment' }),
      required: true,
    },
    {
      name: 'mktAppVersion',
      label: formatMessage({ id: `${intlPrefix}.version` }),
      required: true,
    },
  ],
  // events: {
  //   load: ({ dataSet }: { dataSet: DataSet }) => {
  //     const record = dataSet.current;
  //     if (record) {
  //       record.set({
  //         envName: record.get('environmentDTO')?.name,
  //         envId: record.get('environmentDTO')?.id,
  //       });
  //     }
  //   },
  // },
});
