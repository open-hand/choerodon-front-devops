import {
  DataSetProps, FieldType, DataSet,
} from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';
import { map, compact } from 'lodash';

interface SelectProps {
  projectId: number,
  hostId: string,
  formatMessage(arg0: object, arg1?: object): string,
  selectDs: DataSet,
}

export default (({
  formatMessage, projectId, hostId, selectDs,
}: SelectProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  children: { users: selectDs },
  transport: {
    submit: ({ data: [data] }) => {
      const postData = {
        skipCheckPermission: data.skipCheckPermission,
        userIds: data.skipCheckPermission
          ? []
          : compact(map(data.users || [], (item: { user: { iamUserId: string }}) => (
            item?.user?.iamUserId
          ))),
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
    defaultValue: true,
  }],
}));
