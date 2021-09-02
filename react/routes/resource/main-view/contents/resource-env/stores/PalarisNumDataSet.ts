/* eslint-disable import/no-anonymous-default-export */
import { polarisApiConfig } from '@/api';

export default (id:string):any => ({
  autoQuery: false,
  paging: false,
  dataKey: null,
  transport: {
    read: polarisApiConfig.getPolarisRecordData(id),
  },
  fields: [],
});
