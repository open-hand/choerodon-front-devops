/* eslint-disable import/no-anonymous-default-export */
import { environmentApiConfig } from '@/api';

export default ((envId:string):any => ({
  autoQuery: false,
  selection: false,
  paging: true,
  pageSize: 20,
  transport: {
    read: environmentApiConfig.loadListsPermission(envId, null),
  },
}));
