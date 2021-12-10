/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable import/no-anonymous-default-export */
import { DataSetProps, FieldType, DataSet } from '@/interface';
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
    { name: 'realName', label: formatMessage({ id: 'boot.username' }) },
    { name: 'loginName', label: formatMessage({ id: 'c7ncd.resource.LoginName' }) },
    { name: 'roles', label: formatMessage({ id: 'c7ncd.resource.Projectrole' }) },
    { name: 'creationDate', label: formatMessage({ id: 'c7ncd.resource.AddedTime' }) },
    { name: 'permissionLabel', label: formatMessage({ id: 'c7ncd.resource.PermissionType' }) },
  ],
  queryFields: [
    {
      name: 'realName',
      type: 'string' as FieldType,
      label: formatMessage({ id: 'boot.username' }),
    },
    {
      name: 'loginName',
      type: 'string' as FieldType,
      label: formatMessage({ id: 'c7ncd.resource.LoginName' }),
    },
    {
      name: 'permissionLabel',
      type: 'string' as FieldType,
      label: formatMessage({ id: 'c7ncd.resource.PermissionType' }),
      textField: 'text',
      valueField: 'value',
      options: new DataSet({
        data: [
          {
            text: '主机管理权限',
            value: 'administrator',
          },
          {
            text: '主机使用权限',
            value: 'common',
          },
        ],
      }),
    },
  ],
});
