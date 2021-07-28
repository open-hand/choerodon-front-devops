import { DataSetProps, DataSet } from '@/interface';

interface ListProps {
  statusDs: DataSet,
}

export default ({ statusDs }: ListProps): DataSetProps => ({
  autoCreate: true,
  selection: false,
  fields: [
    {
      name: 'search_param',
    },
    {
      name: 'host_status',
      textField: 'text',
      valueField: 'value',
      options: statusDs,
    },
  ],
});
