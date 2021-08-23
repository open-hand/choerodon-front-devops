/* eslint-disable import/no-anonymous-default-export */
export default (projectId:string, envId:string, appId:string, formatMessage:any) => ({
  autoQuery: true,
  transport: {
    read: {
      method: 'get',
      url: `/devops/v1/projects/${projectId}/app_service_instances/list_running_instance?env_id=${envId}&app_service_id=${appId}`,
    },
  },
  events: {
    load: ({ dataSet }:any) => {
      // NOTE: 手动加入所有实例的option选项
      dataSet.create({
        code: formatMessage({ id: 'all_instance' }),
      }, 0);
    },
  },
});
