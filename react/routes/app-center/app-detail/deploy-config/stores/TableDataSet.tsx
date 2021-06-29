import { DataSetProps } from '@/interface';

interface TableProps {
  formatMessage(arg0: object, arg1?: object): string,
}

export default ({ formatMessage }: TableProps): DataSetProps => ({
  selection: false,
  pageSize: 10,
  transport: {},
  fields: [
    {
      name: 'name',
      label: formatMessage({ id: 'name' }),
    },
    {
      name: 'description',
      label: formatMessage({ id: 'description' }),
    },
    {
      name: 'appServiceName',
      label: formatMessage({ id: 'appService' }),
    },
    {
      name: 'envName',
      label: formatMessage({ id: 'environment' }),
    },
    {
      name: 'createUserRealName',
      label: formatMessage({ id: 'creator' }),
    },
    {
      name: 'lastUpdateDate',
      label: formatMessage({ id: 'updateDate' }),
    },
  ],
  queryFields: [
    {
      name: 'name',
      label: formatMessage({ id: 'name' }),
    },
    {
      name: 'appServiceName',
      label: formatMessage({ id: 'appService' }),
    },
    {
      name: 'envName',
      label: formatMessage({ id: 'environment' }),
    },
  ],
});
