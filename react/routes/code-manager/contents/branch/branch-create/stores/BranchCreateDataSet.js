/* eslint-disable import/no-anonymous-default-export */
import JSONBigint from 'json-bigint';
import { axios, issuesApiConfig } from '@choerodon/master';
import { DataSet } from 'choerodon-ui/pro';

export default ({
  projectId, appServiceId, formatMessage, contentStore, projectOptionsDs,
  currentProjectData, getUserId,
}) => {
  async function checkBranchName(value) {
    const endWith = /(\/|\.|\.lock)$/;
    const contain = /(\s|~|\^|:|\?|\*|\[|\\|\.\.|@\{|\/{2,}){1}/;
    const single = /^@+$/;
    let mess = true;
    const prefix = contentStore.getBranchPrefix;
    let branchName = '';
    if (prefix) {
      branchName = `${prefix}${value}`;
    } else {
      branchName = value;
    }
    if (endWith.test(branchName)) {
      mess = formatMessage({ id: 'branch.checkNameEnd' });
    } else if (contain.test(branchName) || single.test(branchName)) {
      mess = formatMessage({ id: 'branch.check' });
    } else {
      await axios.get(`/devops/v1/projects/${projectId}/app_service/${appServiceId}/git/check_branch_name?branch_name=${branchName}`)
        .then((res) => {
          if ((res && res.failed) || !res) {
            mess = formatMessage({ id: 'branch.check.existence' });
          }
        });
    }
    return mess;
  }
  return {
    autoCreate: true,
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
        name: 'branchOrigin',
        type: 'string',
        label: formatMessage({ id: 'branch.source' }),
        required: true,
      },
      {
        name: 'branchType',
        type: 'string',
        required: true,
        label: formatMessage({ id: 'branch.type' }),
      },
      {
        name: 'branchName',
        label: formatMessage({ id: 'branch.name' }),
        required: true,
        type: 'string',
        defaultValue: '',
        validator: checkBranchName,
      },
      {
        name: 'project',
        type: 'object',
        textField: 'name',
        valueField: 'id',
        defaultValue: currentProjectData,
        label: formatMessage({ id: 'branch.issue.source' }),
        options: projectOptionsDs,
        ignore: 'always',
      },
    ],
    transport: {
      create: ({ data: [data] }) => ({
        url: `/devops/v1/projects/${projectId}/app_service/${appServiceId}/git/branch`,
        method: 'post',
        transformRequest: () => {
          const { issueId } = data.issue || {};
          const originBranch = data.branchOrigin;
          const type = data.branchType;
          const branchName = type === 'custom' ? data.branchName : `${data.branchType}-${data.branchName}`;

          const postData = {
            branchName,
            issueId,
            originBranch: originBranch && originBranch.slice(0, -7),
            type,
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
  };
};
