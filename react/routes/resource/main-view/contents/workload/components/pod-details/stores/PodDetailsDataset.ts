import getTablePostData from '@/utils/getTablePostData';

/* eslint-disable import/no-anonymous-default-export */
export default ({
  formatMessage, intlPrefix, projectId, envId, podName, activeTabkey,
}:any):any => ({
  selection: false,
  autoQuery: true,
  pageSize: 10,
  transport: {
    read: ({ data }:any) => {
      const postData = getTablePostData(data);
      return {
        url: `/devops/v1/projects/${projectId}/pods/page_by_kind?env_id=${envId}&kind=${activeTabkey}&name=${podName}`,
        method: 'post',
        data: postData,
      };
    },
    destroy: ({ data }:any) => {
      const podId = data[0].id;
      return {
        url: `/devops/v1/projects/${projectId}/pods/${podId}?env_id=${envId}`,
        method: 'delete',
      };
    },
  },
  queryFields: [
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.instance.pod` }),
    },
    {
      name: 'containers',
      type: 'object',
      label: formatMessage({ id: 'container' }),
    },
  ],
  fields: [
    {
      name: 'status',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.pod.status` }),
    },
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.instance.pod` }),
    },
    {
      name: 'containers',
      type: 'object',
      label: formatMessage({ id: 'container' }),
    },
    {
      name: 'ip',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.instance.ip` }),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: formatMessage({ id: 'boot.createDate' }),
    },
  ],
});
