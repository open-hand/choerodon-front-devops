/* eslint-disable import/no-anonymous-default-export */
export default (({
  projectId,
  gitlabPipelineId,
}:any):any => ({
  autoQuery: true,
  selection: false,
  paging: true,
  transport: {
    read: () => ({
      url: `/devops/v1/projects/${projectId}/image/${gitlabPipelineId}`,
      method: 'get',
    }),
  },
  fields: [
    {
      label: '缺陷码',
      name: 'vulnerabilityCode',
      type: 'string',
    },
    {
      label: '严重度',
      name: 'severity',
      type: 'string',
    },
    {
      label: '组件',
      name: 'pkgName',
      type: 'string',
    },
    {
      label: '当前版本',
      name: 'installedVersion',
      type: 'string',
    },
    {
      label: '修复版本',
      name: 'fixedVersion',
      type: 'string',
    },
    {
      name: 'description',
      type: 'string',
    },
  ],
}));
