import getTablePostData from '@/utils/getTablePostData';

/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, projectId, envId }:any):any => ({
  selection: false,
  autoQuery: true,
  pageSize: 10,
  transport: {
    read: ({ data }:any) => {
      const postData = getTablePostData(data);
      return ({
        url: `/devops/v1/projects/${projectId}/secret/page_by_options?env_id=${envId}`,
        method: 'post',
        data: postData,
      });
    },
    destroy: ({ data: [data] }:any) => ({
      url: `/devops/v1/projects/${projectId}/secret/${envId}/${data.id}`,
      method: 'delete',
      data,
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
    { name: 'description', type: 'string', label: formatMessage({ id: 'description' }) },
    { name: 'key', type: 'object', label: formatMessage({ id: 'key' }) },
    { name: 'value', type: 'object' },
    { name: 'commandStatus', type: 'string' },
    { name: 'lastUpdateDate', type: 'string', label: formatMessage({ id: 'updateDate' }) },
  ],
  queryFields: [
    { name: 'name', type: 'string', label: formatMessage({ id: 'name' }) },
  ],
});
