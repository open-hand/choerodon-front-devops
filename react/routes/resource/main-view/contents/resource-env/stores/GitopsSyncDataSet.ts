/* eslint-disable import/no-anonymous-default-export */
import { environmentApiConfig } from '@/api';

export default (id:string):any => ({
  selection: false,
  paging: false,
  autoQuery: false,
  dataKey: null,
  transport: {
    read: environmentApiConfig.getEnvStatus(id),
  },
  fields: [
    { name: 'sagaSyncCommit', type: 'string' },
    { name: 'commitUrl', type: 'string' },
    { name: 'agentSyncCommit', type: 'string' },
    { name: 'devopsSyncCommit', type: 'string' },
  ],
});
