import { axios } from '@choerodon/boot';
import omit from 'lodash/omit';
import AppServiceApis from '../../../apis';

async function fetchLookup(field, record) {
  const data = await field.fetchLookup();
  if (data && data.length) {
    record.set('templateAppServiceVersionId', data[0].id);
  }
}

export default (({
  intlPrefix, formatMessage, projectId, sourceDs, store,
  siteTemplateOptionsDs, orgTemplateOptionsDs,
}) => {
  async function checkCode(value) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/check_code?code=${value}`);
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

  async function checkName(value) {
    const pa = /^\S+$/;
    if (value && pa.test(value)) {
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/check_name?name=${encodeURIComponent(value)}`);
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

  function handleUpdate({ name, value, record }) {
    if (name === 'templateAppServiceId') {
      record.set('templateAppServiceVersionId', null);
      const field = record.getField('templateAppServiceVersionId');
      field.reset();
      if (value) {
        field.set('lookupAxiosConfig', {
          url: `/devops/v1/projects/${projectId}/app_service_versions/page_by_options?app_service_id=${value}&deploy_only=false&do_page=true&page=1&size=10`,
          method: 'post',
        });
        fetchLookup(field, record);
      }
    }
    if (name === 'appServiceSource') {
      record.set('templateAppServiceId', null);
      record.set('devopsAppTemplateId', null);
      store.setAppService([]);
      switch (value) {
        case 'organization_template':
          if (!orgTemplateOptionsDs.length) {
            orgTemplateOptionsDs.query();
          }
          break;
        case 'site_template':
          if (!siteTemplateOptionsDs.length) {
            siteTemplateOptionsDs.query();
          }
          break;
        default:
          store.loadAppService(projectId, value);
          break;
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
        const res = omit(data, ['appServiceSource', '__id', '__status']);
        return ({
          url: ['organization_template', 'site_template'].includes(data.appServiceSource) && data.devopsAppTemplateId
            ? AppServiceApis.createAppServiceByTemplate(projectId)
            : `/devops/v1/projects/${projectId}/app_service`,
          method: 'post',
          data: { ...res, isSkipCheckPermission: true },
        });
      },
    },
    fields: [
      {
        name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.name` }), required: true, validator: checkName, maxLength: 40,
      },
      {
        name: 'code', type: 'string', label: formatMessage({ id: `${intlPrefix}.code` }), required: true, maxLength: 30, validator: checkCode,
      },
      {
        name: 'type', type: 'string', defaultValue: 'normal', label: formatMessage({ id: `${intlPrefix}.type` }), required: true,
      },
      { name: 'imgUrl', type: 'string' },
      {
        name: 'appServiceSource',
        defaultValue: 'normal_service',
        type: 'string',
        textField: 'text',
        valueField: 'value',
        label: formatMessage({ id: `${intlPrefix}.service.source` }),
        options: sourceDs,
      },
      { name: 'templateAppServiceId', type: 'string', label: formatMessage({ id: intlPrefix }) },
      {
        name: 'templateAppServiceVersionId', type: 'string', textField: 'version', valueField: 'id', label: formatMessage({ id: `${intlPrefix}.version` }),
      },
      {
        name: 'devopsAppTemplateId',
        label: formatMessage({ id: `${intlPrefix}.template.name` }),
        textField: 'name',
        valueField: 'id',
        dynamicProps: {
          options: ({ record }) => (record.get('appServiceSource') === 'organization_template' ? orgTemplateOptionsDs : siteTemplateOptionsDs),
        },
      },
    ],
    events: {
      create: () => {
        store.loadAppService(projectId, 'normal_service');
      },
      update: handleUpdate,
    },
  });
});
