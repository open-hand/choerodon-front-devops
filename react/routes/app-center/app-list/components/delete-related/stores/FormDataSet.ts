import { DataSetProps, DataSet } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number;
  appServiceId: string;
  envOptionsDs: DataSet;
}

export default ({
  projectId, formatMessage, appServiceId, envOptionsDs,
}: FormProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  transport: {
    create: ({ data: [data] }) => {
      const { envId } = data || {};
      return ({
        url: AppCenterApi.deleteServiceRelated(projectId),
        method: 'delete',
        params: { env_id: envId, app_service_id: appServiceId },
      });
    },
  },
  fields: [
    {
      name: 'envId',
      textField: 'name',
      valueField: 'id',
      label: formatMessage({ id: 'environment' }),
      options: envOptionsDs,
      required: true,
    },
  ],
});
