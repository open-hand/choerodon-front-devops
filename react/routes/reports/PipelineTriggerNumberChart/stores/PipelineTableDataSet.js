/* eslint-disable import/no-anonymous-default-export */
export default ({
  projectId,
  selectedPipelineId,
  startDate,
  endDate,
}) => ({
  selection: false,
  autoQuery: true,
  paging: true,
  transport: {
    read: () => (selectedPipelineId && startDate && endDate ? {
      url: `devops/v1/projects/${projectId}/cicd_pipelines/trigger/page?pipeline_id=${selectedPipelineId}&start_time=${startDate}&end_time=${endDate}`,
      method: 'get',
    } : {}),
  },
  fields: [
    {
      name: 'status',
      label: '状态',
    },
    {
      name: 'viewId',
      label: '执行编号',
    },
    {
      name: 'pipelineName',
      label: '流水线名称',
    },
    {
      name: 'stageRecordVOS',
      label: '阶段',
    },
    {
      name: 'appServiceName',
      label: '关联应用服务',
    },
    {
      name: 'startDate',
      label: '开始时间',
    },
    {
      name: 'durationSeconds',
      label: '执行耗时',
    },
    {
      name: 'user',
      label: '触发者',
    },
  ],
});
