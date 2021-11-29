/* eslint-disable import/no-anonymous-default-export */
import compact from 'lodash/compact';
import JSONBigint from 'json-bigint';
import uniq from 'lodash/uniq';
import { DataSet } from 'choerodon-ui/pro';
import { issuesApiConfig } from '@choerodon/master';

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
      name: 'issue',
      type: 'object',
      textField: 'summary',
      valueField: 'issueId',
      label: formatMessage({ id: 'branch.issueName' }),
      options: new DataSet({
        selection: 'single',
        paging: true,
        pageSize: 10,
        autoQuery: true,
        transport: {
          read({
            dataSet, record, params: { page },
          }) {
            const project = record?.get('project');
            const selectedProjectId = project?.id ?? projectId;
            const userIds = dataSet?.getState('myquestionBool') ? [getUserId] : [];
            return {
              url: issuesApiConfig.loadSummaryData(selectedProjectId, page).url,
              method: 'post',
              data: {
                onlyActiveSprint: false,
                self: true,
                content: dataSet.getQueryParameter('content'),
                userIds,
              },
              transformResponse: (res) => {
                try {
                  const newRes = JSONBigint.parse(res);
                  if (newRes.content.length > 0 && newRes.number === 0) {
                    newRes.content.unshift({
                      issueId: '-1',
                      summary: '我的问题myquestion',
                    });
                  }
                  return newRes;
                } catch (e) {
                  return res;
                }
              },
            };
          },
        },
      }),
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
