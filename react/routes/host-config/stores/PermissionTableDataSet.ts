import { DataSet, DataSetProps } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';
import getTablePostData from '@/utils/getTablePostData';
import { omit } from 'lodash';

interface ListProps {
  projectId: number,
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

export default ({ projectId, formatMessage, intlPrefix }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  transport: {
    read: ({ data }) => {
      const { hostId } = data || {};
      const postData = getTablePostData(omit(data, 'hostId'));
      return ({
        url: HostConfigApi.getHostPermissionList(projectId, hostId),
        method: 'post',
        data: postData,
      });
    },
  },
  fields: [
    { name: 'realName', label: formatMessage({ id: 'userName' }) },
    { name: 'loginName', label: formatMessage({ id: 'loginName' }) },
    { name: 'roles', label: formatMessage({ id: 'projectRole' }) },
    { name: 'creationDate', label: formatMessage({ id: 'permission_addTime' }) },
  ],
  queryFields: [
    {
      name: 'realName',
      label: formatMessage({ id: 'userName' }),
    },
    {
      name: 'loginName',
      label: formatMessage({ id: 'loginName' }),
    },
  ],
});
