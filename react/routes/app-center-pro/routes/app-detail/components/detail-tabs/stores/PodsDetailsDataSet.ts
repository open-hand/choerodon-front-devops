/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, intlPrefix }:{
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix:string
}):any => ({
  selection: false,
  pageSize: 10,
  transport: {
    read: ({ data }: {
      data: any,
    }) => ({
      url: 'devops/v1/projects/159349538124681216/pods/page_by_options?page=0&size=10&app_service_id=159349909575643136&env_id=213042113808347136&instance_id=216159092320714752',
      method: 'post',
      data: {
        params: [],
        searchParam: {},
      },
    }),
    destroyed: {
      // url: `devops/v1/projects/${projectId}/pods/${podId}?env_id=${envId}`,
      method: 'delete',
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
