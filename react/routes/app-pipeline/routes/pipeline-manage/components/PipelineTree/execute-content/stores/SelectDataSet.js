export default ({
  formatMessage, projectId, gitlabProjectId, pipelineId, appServiceName, VariableDataSet,
}) => ({
  autoCreate: true,
  selection: 'single',
  transport: {
    create: ({ data: [data] }) => {
      const branchName = data.branch && data.branch.slice(0, -7);
      const isTag = data.branch && data.branch.slice(-7) === '_type_t';
      const variables = {};
      if (VariableDataSet.records.length > 0 && VariableDataSet.records[0].get('key')) {
        VariableDataSet.toData().forEach((item) => {
          variables[item.key] = item.value;
        });
      }
      return {
        url: `devops/v1/projects/${projectId}/cicd_pipelines/${pipelineId}/execute?gitlab_project_id=${gitlabProjectId}&ref=${branchName}&tag=${isTag}`,
        method: 'post',
        data: variables,
      };
    },
  },
  fields: [
    {
      name: 'appServiceName',
      type: 'string',
      label: '应用服务',
      defaultValue: appServiceName,
    },
    {
      name: 'branch',
      type: 'string',
      required: true,
      label: '分支',
    },
  ],
});
