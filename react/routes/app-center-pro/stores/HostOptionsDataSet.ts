/* eslint-disable import/no-anonymous-default-export */
import { hostApiConfig } from '@/api';

export default (): any => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: hostApiConfig.loadHostsList(),
  },
});
