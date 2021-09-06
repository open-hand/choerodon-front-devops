import { polarisApiConfig } from '@/api';

/* eslint-disable import/no-anonymous-default-export */
export default (id:string):any => ({
  autoQuery: false,
  paging: false,
  dataKey: null,
  transport: {
    read: polarisApiConfig.getPolarisEnv(id),
  },
  fields: [],
});
