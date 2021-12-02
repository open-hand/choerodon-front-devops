/* eslint-disable import/no-anonymous-default-export */
import { environmentApiConfig } from '@/api';

export default ({
  formatMessage, intlPrefix, id, format,
}:any):any => ({
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
      label: format({ id: 'ErrorMessage' }),
    },
    {
      name: 'filePath',
      type: 'string',
      label: format({ id: 'File' }),
    },
    {
      name: 'commit',
      type: 'string',
      label: format({ id: 'Commit' }),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: format({ id: 'WrongTime' }),
    },
  ],
});
