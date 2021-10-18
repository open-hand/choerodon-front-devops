/* eslint-disable import/no-anonymous-default-export */
import { omit } from 'lodash';
import { DataSet, DataSetProps, FieldType } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';
import getTablePostData from '@/utils/getTablePostData';
import { StoreProps } from '@/routes/host-config/stores/useStore';

interface ListProps {
  projectId: number,
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  mainStore: StoreProps,
}

export default ({
  projectId, formatMessage, intlPrefix, mainStore,
}: ListProps): DataSetProps & any => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  transport: {
    read: ({ data }:any) => {
      const postData = getTablePostData(data);
      return ({
        url: HostConfigApi.getHostPermissionList(projectId, mainStore.getSelectedHost?.id),
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }:any) => ({
      url: HostConfigApi.deletePermission(projectId, mainStore.getSelectedHost?.id, data.iamUserId),
      method: 'delete',
    }),
  },
  fields: [
    { name: 'realName', label: formatMessage({ id: 'userName' }) },
    { name: 'loginName', label: formatMessage({ id: 'loginName' }) },
    { name: 'roles', label: formatMessage({ id: 'projectRole' }) },
    { name: 'creationDate', label: formatMessage({ id: 'permission_addTime' }) },
    { name: 'permissionLabel', label: formatMessage({ id: 'permission_type' }) },
  ],
  queryFields: [
    {
      name: 'realName',
      type: 'string' as FieldType,
      label: formatMessage({ id: 'userName' }),
    },
    {
      name: 'loginName',
      type: 'string' as FieldType,
      label: formatMessage({ id: 'loginName' }),
    },
  ],
});
