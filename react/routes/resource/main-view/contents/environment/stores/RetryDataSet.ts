import { environmentApiConfig } from '@/api';

export default (id:string):any => ({
  selection: false,
  paging: false,
  dataKey: null,
  transport: {
    read: environmentApiConfig.envRetry(id),
  },
  fields: [],
});
