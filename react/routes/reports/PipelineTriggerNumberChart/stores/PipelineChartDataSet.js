/* eslint-disable import/no-anonymous-default-export */
export default ({
  projectId,
  selectedPipelineId,
  startDate,
  endDate,
}) => ({
  paging: false,
  autoQuery: true,
  transport: {
    read: ({ dataSet }) => (selectedPipelineId && startDate && endDate ? {
      url: `devops/v1/projects/${projectId}/cicd_pipelines/trigger?pipeline_id=${selectedPipelineId}&start_time=${startDate}&end_time=${endDate}`,
      method: 'get',
    } : {}),
  },
});
