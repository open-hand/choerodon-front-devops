/* eslint-disable import/no-anonymous-default-export */
import compact from 'lodash/compact';
import JSONBigint from 'json-bigint';
import uniq from 'lodash/uniq';
import CodeManagerApis from '@/routes/code-manager/apis';

export default ({
  projectId, formatMessage, appServiceId, objectVersionNumber,
  branchName, projectOptionsDs, projectName, getUserId,
}) => ({
  autoCreate: false,
  autoQuery: false,
  selection: 'single',
  paging: false,
  fields: [
    {
      name: 'pageSize',
      type: 'number',
      defaultValue: 20,
    },
    {
      name: 'issue',
      type: 'object',
      textField: 'summary',
      valueField: 'issueId',
      label: formatMessage({ id: 'branch.issueName' }),
      lookupAxiosConfig: ({ dataSet, record, params }) => {
        const project = record?.get('project');
        const selectedProjectId = project?.id ?? projectId;
        const userIds = dataSet.getState('myquestionBool') ? [getUserId] : [];
        return {
          url: CodeManagerApis.loadSummaryData(selectedProjectId, record?.get('pageSize')),
          method: 'post',
          data: {
            onlyActiveSprint: false,
            self: true,
            content: params.content,
            userIds,
          },
          transformResponse: (res) => {
            try {
              const newRes = JSONBigint.parse(res);
              if (newRes.content.length) {
                newRes.content.unshift({
                  issueId: '-1',
                  summary: '我的问题myquestion',
                });
              }
              if (
                newRes.number + 1 * newRes.size < newRes.totalElements
              ) {
                newRes.content.push({
                  issueId: 'more',
                  summary: '加载更多',
                });
              }
              return newRes.content;
            } catch (e) {
              return res;
            }
          },
        };
      },
    },
    {
      name: 'project',
      type: 'object',
      textField: 'name',
      valueField: 'id',
      defaultValue: { id: projectId, name: projectName },
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
