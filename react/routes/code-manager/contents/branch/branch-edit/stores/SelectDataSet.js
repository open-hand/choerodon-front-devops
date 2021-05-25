import map from 'lodash/map';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import CodeManagerApis from '@/routes/code-manager/apis';

export default ({
  projectId, formatMessage, appServiceId, objectVersionNumber,
  branchName, projectOptionsDs,
}) => ({
  autoCreate: false,
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
        const issue = record?.get('issue');
        const selectedProjectId = project?.id ?? projectId;
        const issueId = issue?.issueId ?? projectId;
        return {
          url: CodeManagerApis.loadSummaryData(selectedProjectId),
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
      label: formatMessage({ id: 'branch.issue.source' }),
      options: projectOptionsDs,
    },
  ],
  transport: {
    submit: ({ dataSet }) => ({
      url: `/devops/v1/projects/${projectId}/app_service/${appServiceId}/git/update_branch_issue`,
      method: 'put',
      transformRequest: () => {
        const issueIds = dataSet.map((record) => (record?.get('issue')?.issueId));
        const newIssueIds = uniq(compact(issueIds || []) || []);
        const postData = {
          appServiceId,
          issueIds: newIssueIds,
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
        record.get('issue') && record.set('issue', null);
        field.reset();
        if (value) {
          field.fetchLookup();
        }
      }
    },
  },
});
