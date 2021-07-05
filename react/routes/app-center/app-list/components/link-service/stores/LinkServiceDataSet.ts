import { DataSetProps, DataSet } from '@/interface';

interface OptionProps {
  formatMessage(arg0: object, arg1?: object): string,
  serviceOptionsDs: DataSet,
}

export default ({ formatMessage, serviceOptionsDs }: OptionProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'appServiceId',
      textField: 'name',
      valueField: 'id',
      label: formatMessage({ id: 'appService' }),
      required: true,
      options: serviceOptionsDs,
    },
  ],
});
