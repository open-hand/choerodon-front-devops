/* eslint-disable import/no-anonymous-default-export */
import { axios } from '@choerodon/master';
import some from 'lodash/some';

export default ({
  formatMessage, intlPrefix, projectId, pathListDs, annotationDs,
}:any):any => {
  async function checkName(value:any, name:any, record:any) {
    const parentRecord = record.cascadeParent;
    if (!parentRecord) {
      return null;
    }
    const envId = parentRecord.get('environmentId');
    if (!envId) {
      return null;
    }
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    if (value) {
      if (p.test(value)) {
        try {
          const res = await axios.get(`/devops/v1/projects/${projectId}/ingress/check_name?env_id=${envId}&name=${value}`);
          if (res && !res.failed) {
            return true;
          }
          return formatMessage({ id: 'checkNameExist' });
        } catch (e) {
          return formatMessage({ id: 'checkNameFailed' });
        }
      } else {
        return formatMessage({ id: 'domain.name.check.failed' });
      }
    }
    return null;
  }

  function checkDomain(value:any) {
    if (!value) {
      return null;
    }
    const pattern = /^(\*\.)?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (!pattern.test(value)) {
      return formatMessage({ id: 'domain.domain.check.reg.failed' });
    }
    return null;
  }

  function handleUpdate({ name, value, record }:any) {
    if (name === 'domain') {
      pathListDs.forEach((pathRecord:any) => pathRecord.getField('path').checkValidity());
    }

    if (name === 'isNormal') {
      record.get('certId') && record.set('certId', null);
    }
  }

  function renderLookupUrl({ record }:any) {
    const parentRecord = record.cascadeParent;
    if (!parentRecord) {
      return null;
    }
    const envId = parentRecord.get('environmentId');
    const domain = record.get('domain');
    if (domain && !record.get('isNormal')) {
      return {
        url: `/devops/v1/projects/${projectId}/certifications/active?env_id=${envId}&domain=${domain}`,
        method: 'post',
      };
    }
    return null;
  }

  function isRequired({ record }:any) {
    const hasValue = record.get('name') || record.get('domain') || record.get('certId');
    const pathDirty = some(record.getCascadeRecords('pathList'), (pathRecord) => pathRecord.dirty);
    const annotationDirty = some(record.getCascadeRecords('annotations'), (annotationRecord) => annotationRecord.dirty);
    return !!hasValue || pathDirty || annotationDirty;
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    children: {
      pathList: pathListDs,
      annotations: annotationDs,
    },
    fields: [
      {
        name: 'name',
        type: 'string',
        label: formatMessage({ id: 'domain.column.name' }),
        validator: checkName,
        maxLength: 40,
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'domain',
        type: 'string',
        label: formatMessage({ id: 'domain.form.domain' }),
        validator: checkDomain,
        maxLength: 50,
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'isNormal',
        type: 'boolean',
        defaultValue: true,
        ignore: 'always',
        label: formatMessage({ id: 'domain.protocol.type' }),
        dynamicProps: {
          required: isRequired,
        },
      },
      {
        name: 'certId',
        type: 'string',
        textField: 'certName',
        valueField: 'id',
        label: formatMessage({ id: 'domain.form.cert' }),
        dynamicProps: {
          required: ({ record }:any) => isRequired({ record }) && !record.get('isNormal'),
          lookupAxiosConfig: renderLookupUrl,
        },
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
