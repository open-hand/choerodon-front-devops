/* eslint-disable import/no-anonymous-default-export */
export default ({
  formatMessage, intlPrefix, projectId, appCenterId, envId,
}:{
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix:string,
  projectId:string,
  appCenterId:string,
  envId:string
}):any => ({
  selection: false,
  autoQuery: false,
  paging: true,
  pageSize: 10,
  transport: {
    read: ({ data }: {
      data: any,
    }) => (appCenterId ? ({
      url: `devops/v1/projects/${projectId}/deploy_app_center/${appCenterId}/env_pods_page`,
      method: 'post',
      data: {
        params: [],
        searchParam: {},
      },
    }) : {}),
    destroy: ({ data }: {
      data: any,
    }) => {
      const podId = data[0].id;
      return {
        url: `devops/v1/projects/${projectId}/pods/${podId}?env_id=${envId}`,
        method: 'delete',
      };
    },
  },
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
      label: formatMessage({ id: 'createDate' }),
    },
  ],
});
