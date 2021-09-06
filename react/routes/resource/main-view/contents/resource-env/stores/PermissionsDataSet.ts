/* eslint-disable max-len */
import map from 'lodash/map';
import { environmentApiConfig } from '@/api';
import getTablePostData from '@/utils/getTablePostData';

/* eslint-disable import/no-anonymous-default-export */
export default ({
  formatMessage, intlPrefix, id, baseInfoDs,
}:any):any => ({
  selection: false,
  pageSize: 10,
  transport: {
    destroy: ({ data: [data] }:any) => environmentApiConfig.deleteUserByPermission(id, data.iamUserId),
    read: ({ data }:any) => {
      const postData = getTablePostData(data);
      return environmentApiConfig.loadPermissionsByOpts(id, postData);
    },
    create: ({ data }:any) => {
      const res = {
        userIds: map(data, 'iamUserId'),
        envId: id,
        objectVersionNumber: baseInfoDs.current?.get('objectVersionNumber'),
        skipCheckPermission: baseInfoDs.current?.get('skipCheckPermission'),
      };
      return environmentApiConfig.addUserByPermission(id, res);
    },
  },
  fields: [
    {
      name: 'realName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.user` }),
    },
    {
      name: 'loginName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.name` }),
    },
    {
      name: 'roles',
      type: 'object',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.role` }),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.addTime` }),
    },
    {
      name: 'iamUserId', type: 'string', textField: 'realName', valueField: 'iamUserId', label: formatMessage({ id: `${intlPrefix}.project.member` }),
    },
  ],
  queryFields: [
    {
      name: 'realName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.user` }),
    },
    {
      name: 'loginName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.name` }),
    },
  ],
});
