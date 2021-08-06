import { DataSetProps, DataSet } from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';
import map from 'lodash/map';
import compact from 'lodash/compact';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number;
  linkServiceDs: DataSet;
  envOptionsDs: DataSet;
  serviceOptionsDs: DataSet;
  showEnvSelect: boolean,
}

export default ({
  projectId, formatMessage, linkServiceDs, envOptionsDs, showEnvSelect, serviceOptionsDs,
}: FormProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  children: {
    appServiceIds: linkServiceDs,
  },
  transport: {
    create: ({ data: [data] }) => {
      const { envId, appServiceIds } = data || {};
      const postData = {
        envId,
        appServiceIds: compact(map(appServiceIds, 'appServiceId')),
      };
      return ({
        url: AppCenterApi.createRelatedAppService(projectId),
        method: 'post',
        data: postData,
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
      required: showEnvSelect,
    },
  ],
  events: {
    update: ({ name, value }: { name: string, value: string }) => {
      if (name === 'envId' && value) {
        // linkServiceDs.reset();
        serviceOptionsDs.setQueryParameter('env_id', value);
        serviceOptionsDs.query();
      }
    },
  },
});
