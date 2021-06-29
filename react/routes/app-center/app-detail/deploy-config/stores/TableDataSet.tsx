import { DataSetProps, DataSet } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';

interface TableProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  appServiceId: string,
}

export default ({
  formatMessage, projectId, appServiceId,
}: TableProps): DataSetProps => ({
  autoQuery: false,
  selection: false,
  pageSize: 10,
  transport: {
    read: {
      url: AppCenterApi.getDeployConfigList(projectId, appServiceId),
      method: 'get',
    },
  },
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
