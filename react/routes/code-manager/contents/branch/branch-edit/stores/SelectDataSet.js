export default ({
  projectId, issueId, formatMessage, appServiceId, objectVersionNumber,
  branchName, projectOptionsDs, currentProjectData,
}) => ({
  autoCreate: true,
  autoQuery: false,
  selection: 'single',
  paging: false,
  fields: [
    {
      name: 'issue',
      type: 'object',
      textField: 'summary',
      valueField: 'issueId',
      label: formatMessage({ id: 'branch.issueName' }),
      lookupAxiosConfig: ({ record }) => {
        const project = record?.get('project');
        const selectedProjectId = project?.id ?? projectId;
        return {
          url: `/agile/v1/projects/${selectedProjectId}/issues/summary`,
          method: 'get',
          params: { onlyActiveSprint: false, self: true, issueId: issueId ?? '' },
        };
      },
    },
    {
      name: 'project',
      type: 'object',
      textField: 'name',
      valueField: 'id',
      defaultValue: currentProjectData,
      label: formatMessage({ id: 'branch.issue.source' }),
      options: projectOptionsDs,
    },
  ],
  transport: {
    create: ({ data: [data] }) => ({
      url: `/devops/v1/projects/${projectId}/app_service/${appServiceId}/git/update_branch_issue`,
      method: 'put',
      transformRequest: () => {
        const { issueId: currentIssueId } = data.issue || {};
        const postData = {
          appServiceId,
          issueId: currentIssueId,
          objectVersionNumber,
          branchName,
        };
        return JSON.stringify(postData);
      },
    }),
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'project') {
        const field = record.getField('issue');
        field.reset();
        if (value) {
          field.fetchLookup();
        }
      }
    },
  },
});
