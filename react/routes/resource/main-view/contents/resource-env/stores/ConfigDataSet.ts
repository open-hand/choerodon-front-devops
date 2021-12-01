import { deployValueConfigApi } from '@/api';
import getTablePostData from '@/utils/getTablePostData';

/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, id }:any):any => ({
  selection: false,
  autoQuery: false,
  pageSize: 10,
  transport: {
    destroy: ({ data: [data] }:any) => deployValueConfigApi.deleteDeployValue(data.id, null),
    read: ({ data }:any) => {
      const postData = getTablePostData(data);
      return deployValueConfigApi.loadDeployValue(id, postData);
    },
  },
  fields: [
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: 'name' }),
    },
    {
      name: 'description',
      type: 'string',
      label: formatMessage({ id: 'description' }),
    },
    {
      name: 'appServiceName',
      type: 'string',
      label: formatMessage({ id: 'appService' }),
    },
    {
      name: 'envName',
      type: 'string',
      label: formatMessage({ id: 'environment' }),
    },
    {
      name: 'createUserRealName',
      type: 'string',
      label: formatMessage({ id: 'creator' }),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: formatMessage({ id: 'boot.updateDate' }),
    },
  ],
  queryFields: [
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: 'name' }),
    },
    {
      name: 'appServiceName',
      type: 'string',
      label: formatMessage({ id: 'appService' }),
    },
    {
      name: 'envName',
      type: 'string',
      label: formatMessage({ id: 'environment' }),
    },
  ],
});
