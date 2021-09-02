/* eslint-disable import/no-anonymous-default-export */
import { environmentApiConfig } from '@/api';

export default ({ formatMessage, intlPrefix, id }:any):any => ({
  selection: false,
  autoQuery: false,
  pageSize: 10,
  transport: {
    read: environmentApiConfig.getEnvErrorFiles(id),
  },
  fields: [
    {
      name: 'error',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.error.info` }),
    },
    {
      name: 'filePath',
      type: 'string',
      label: formatMessage({ id: 'file' }),
    },
    {
      name: 'commit',
      type: 'string',
      label: formatMessage({ id: 'commit' }),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: formatMessage({ id: `${intlPrefix}.environment.error.time` }),
    },
  ],
});
