import {
  DataSetProps, FieldType, DataSet,
} from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';
import { map } from 'lodash';

interface SelectProps {
  projectId: number,
  hostId: string,
  formatMessage(arg0: object, arg1?: object): string,
  selectDs: DataSet,
  hostData: {
    skipCheckPermission: boolean,
    objectVersionNumber: number,
  }
}

export default (({
  formatMessage, projectId, hostId, selectDs, hostData,
}: SelectProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  children: { users: selectDs },
  transport: {
    create: ({ data: [data] }) => {
      const postData = {
        hostId,
        objectVersionNumber: hostData.objectVersionNumber,
        skipCheckPermission: data.skipCheckPermission,
        userIds: data.skipCheckPermission
          ? []
          : map(data.users || [], (item: { user: { iamUserId: string }}) => (
            item?.user?.iamUserId
          )),
      };
      return ({
        url: HostConfigApi.updateHostPermission(projectId, hostId),
        method: 'post',
        data: postData,
      });
    },
  },
  fields: [{
    name: 'skipCheckPermission',
    type: FieldType.boolean,
    label: formatMessage({ id: 'permission_assignment' }),
    defaultValue: hostData?.skipCheckPermission,
  }],
}));
