/* eslint-disable import/no-anonymous-default-export */
import { environmentApiConfig } from '@/api';

export default (): any => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: environmentApiConfig.loadEnvList(),
  },
});
