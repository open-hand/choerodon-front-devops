/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable default-case */
/* eslint-disable import/no-anonymous-default-export */
import map from 'lodash/map';
import pick from 'lodash/pick';
import {
  appServiceApiConfig, marketApiConfig, appServiceApi, groupsApiConfig,
} from '@/api';

function getRequestData(appServiceList) {
  const res = map(appServiceList, ({
    id, name, code, type, versionId,
  }) => ({
    appServiceId: id,
    appName: name,
    appCode: code,
    type,
    versionId,
  }));
  return res;
}
function getGitlabRequestData(appServiceList) {
  const res = map(appServiceList, ({
    id, serverName, name, type,
  }) => ({
    gitlabProjectId: id,
    name: serverName,
    code: name,
    type,
  }));
  return res;
}

function getMarketRequestData(appServiceList) {
  const res = map(appServiceList, ({
    name, code, type, deployObjectId,
  }) => ({
    appName: name,
    appCode: code,
    deployObjectId,
  }));
  return res;
}

function isGit({ record }) {
  const flag = record.get('platformType') === 'github' || (record.get('platformType') === 'gitlab' && record.get('isGitLabTemplate')) || record.get('platformType') === 'gerneralGit';
  return flag;
}

export default ({
  intlPrefix, formatMessage, projectId, selectedDs, importTableDs, marketSelectedDs, gitlabSelectedDs,
}) => {
  async function checkCode(value) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value) {
      if (pa.test(value)) {
        try {
          const res = await appServiceApi.checkCode(value);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkCodeExist' });
          }
          return true;
        } catch (err) {
          return formatMessage({ id: 'checkCodeFailed' });
        }
      } else {
        return formatMessage({ id: 'checkCodeReg' });
      }
    }
    return false;
  }

  async function checkName(value) {
    const pa = /^\S+$/;
    if (value) {
      if (pa.test(value)) {
        try {
          const res = await appServiceApi.checkName(value);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkNameExist' });
          }
          return true;
        } catch (err) {
          return formatMessage({ id: `${intlPrefix}.name.failed` });
        }
      } else {
        return formatMessage({ id: 'nameCanNotHasSpaces' });
      }
    }
    return false;
  }

  function handleUpdate({ record, name, value }) {
    if (name === 'platformType') {
      selectedDs.removeAll();
      switch (value) {
        case 'share':
          importTableDs.setQueryParameter('share', true);
          break;
        case 'github':
          if (record.get('repositoryUrl') || !record.getField('repositoryUrl').isValid()) {
            record.set('repositoryUrl', null);
          }
          if (record.get('isTemplate')) {
            record.getField('githubTemplate').fetchLookup();
            record.get('githubTemplate') && record.set('repositoryUrl', record.get('githubTemplate'));
          }
          if (record.get('name')) {
            record.set('name', null);
          }
          if (record.get('code')) {
            record.set('code', null);
          }
          record.set('type', 'normal');
          break;
        case 'gitlab':
          if (record.get('repositoryUrl') || !record.getField('repositoryUrl').isValid()) {
            record.set('repositoryUrl', null);
          }
          if (record.get('name')) {
            record.set('name', null);
          }
          if (record.get('code')) {
            record.set('code', null);
          }
          record.set('type', 'normal');
          break;
        default:
          break;
      }
    }
    if (name === 'githubTemplate') {
      record.set('repositoryUrl', value);
    }
    if (name === 'isTemplate') {
      record.get('repositoryUrl') && record.set('repositoryUrl', null);
      if (value && record.get('githubTemplate')) {
        record.set('repositoryUrl', record.get('githubTemplate'));
      }
    }
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    paging: false,
    transport: {
      create: ({ data: [data] }) => {
        const { platformType, isGitLabTemplate } = data;
        let url = 'external';
        let res;
        let result;
        switch (platformType) {
          case 'gitlab':
            if (isGitLabTemplate) {
              res = pick(data, ['code', 'name', 'repositoryUrl', 'accessToken', 'repositoryUrl']);
              res.type = 'normal';
              result = appServiceApiConfig.Import(url, res);
              break;
            }
            res = getGitlabRequestData(gitlabSelectedDs.toData());
            result = appServiceApiConfig.batchTransfer(res);
            break;
          case 'github':
            res = pick(data, ['code', 'name', 'repositoryUrl']);
            res.type = 'normal';
            url = `${url}${data.isTemplate ? '?is_template=true' : ''}`;
            result = appServiceApiConfig.Import(url, res);
            break;
          case 'share':
            res = getRequestData(selectedDs.toData());
            url = 'internal';
            result = appServiceApiConfig.Import(url, res);
            break;
          case 'market':
            res = getMarketRequestData(marketSelectedDs.toData());
            result = marketApiConfig.Import(res);
            break;
          case 'gerneralGit':
            url = 'general_git';
            res = pick(data, ['code', 'name', 'repositoryUrl', 'username', 'password']);
            res.type = 'normal';
            result = appServiceApiConfig.Import(url, res);
            break;
        }
        return result;
      },
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        maxLength: 40,
        dynamicProps: {
          required: isGit,
          validator: ({ record }) => isGit({ record }) && checkName,
        },
        label: formatMessage({ id: `${intlPrefix}.name` }),
      },
      {
        name: 'username',
        type: 'string',
        maxLength: 40,
        dynamicProps: {
          required: ({ record }) => record.get('platformType') === 'gerneralGit',
        },
        label: formatMessage({ id: `${intlPrefix}.username` }),
      },
      {
        name: 'password',
        type: 'string',
        maxLength: 40,
        dynamicProps: {
          required: ({ record }) => record.get('platformType') === 'gerneralGit',
        },
        label: formatMessage({ id: `${intlPrefix}.password` }),
      },
      {
        name: 'code',
        type: 'string',
        maxLength: 30,
        dynamicProps: {
          required: isGit,
          validator: ({ record }) => isGit({ record }) && checkCode,
        },
        label: formatMessage({ id: `${intlPrefix}.code` }),
      },
      {
        name: 'platformType',
        type: 'string',
        defaultValue: 'github',
        label: formatMessage({ id: `${intlPrefix}.import.type` }),
      },
      {
        name: 'repositoryUrl',
        type: 'url',
        dynamicProps: {
          required: isGit,
          label: ({ record }) => {
            if (record.get('platformType') === 'gitlab' || record.get('platformType') === 'github' || record.get('platformType') === 'gerneralGit') {
              return formatMessage({ id: `${intlPrefix}.url.${record.get('platformType')}.clone` });
            }
            return false;
          },
        },
      },
      {
        name: 'accessToken',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('platformType') === 'gitlab' && record.get('isGitLabTemplate'),
        },
        label: formatMessage({ id: `${intlPrefix}.token` }),
      },
      {
        name: 'isTemplate',
        type: 'bool',
        defaultValue: true,
        label: formatMessage({ id: `${intlPrefix}.import.type` }),
      },
      {
        name: 'isGitLabTemplate',
        type: 'bool',
        defaultValue: true,
      },
      {
        name: 'githubTemplate',
        type: 'string',
        textField: 'name',
        valueField: 'path',
        dynamicProps: {
          lookupUrl: ({ record }) => (record.get('platformType') === 'github' ? `/devops/v1/projects/${projectId}/app_service/list_service_templates` : ''),
          required: ({ record }) => record.get('platformType') === 'github' && record.get('isTemplate'),
        },
        label: formatMessage({ id: `${intlPrefix}.github.template` }),
      },
      {
        name: 'gitlabTemplate',
        type: 'object',
        textField: 'name',
        valueField: 'id',
        label: 'GitLab Group',
        dynamicProps: {
          lookupUrl: ({ record }) => (record.get('platformType') === 'github' ? `/devops/v1/projects/${projectId}/app_service/list_service_templates` : ''),
          required: ({ record }) => record.get('platformType') === 'gitlab' && !record.get('isGitLabTemplate'),
        },
        lookupAxiosConfig: (data) => (groupsApiConfig.getGroups()),
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
