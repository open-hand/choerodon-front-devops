import { DataSetProps, FieldType } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

interface SelectProps {
  projectId: number,
  hostId: string,
  formatMessage(arg0: object, arg1?: object): string,
  random: number,
  hostData: {
    skipCheckPermission: boolean,
    objectVersionNumber: number,
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (({
  projectId, hostId, formatMessage, random, hostData,
}: SelectProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  fields: [
    {
      required: true,
      name: 'user',
      type: 'object' as FieldType,
      textField: 'realName',
      valueField: 'iamUserId',
      label: formatMessage({ id: 'member' }),
      lookupAxiosConfig: ({ params }) => {
        const { name } = params || {};
        return ({
          url: HostConfigApi.getHostNonRelated(projectId, hostId, random),
          method: 'post',
          data: name ? { params: [name], searchParam: {} } : null,
        });
      },
    },
  ],
  transport: {
    submit: ({ data, dataSet }) => {
      const arr = dataSet?.map((record) => record.get('user').iamUserId);
      const postData = {
        hostId,
        objectVersionNumber: hostData.objectVersionNumber,
        permissionLabel: dataSet?.getState('permissionLabel'),
        userIds: arr,
      };
      return ({
        url: HostConfigApi.updateHostPermission(projectId, hostId),
        method: 'post',
        data: postData,
      });
    },
  },
}));
