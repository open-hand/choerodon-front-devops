/* eslint-disable */
import { axios } from '@choerodon/master';
import omit from 'lodash/omit';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import pick from 'lodash/pick';
import isEmpty from 'lodash/isEmpty';

function formatAnnotation(postData: Pick<any, string | number | symbol>, data: { annotations: any; }, oldAnnotations?: any) {
  const annotations:any = {};
  forEach(oldAnnotations || data.annotations, ({ key, value }) => {
    if (key && value) {
      annotations[key] = value;
    }
  });
  postData.annotations = isEmpty(annotations) ? null : annotations;
}

export default ({
  formatMessage, intlPrefix, projectId, envId, ingressId,
  pathListDs, serviceDs, appServiceId, annotationDs,
}:any):any => {
  async function checkName(value: string) {
    if (ingressId) return;
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    if (value) {
      if (envId && p.test(value)) {
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
  }

  function checkDomain(value: string) {
    const pattern = /^(\*\.)?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (!pattern.test(value)) {
      return formatMessage({ id: 'domain.domain.check.reg.failed' });
    }
  }

  function handleUpdate({ name, value, record }:any) {
    if (name === 'domain') {
      pathListDs.forEach((pathRecord: { getField: (arg0: string) => { (): any; new(): any; checkValidity: { (): any; new(): any; }; }; }) => pathRecord.getField('path').checkValidity());
    }

    if (name === 'isNormal') {
      if (ingressId && !value && record.get('domain') && record.get('domain') === record.getPristineValue('domain') && record.getPristineValue('certId')) {
        record.set('certId', record.getPristineValue('certId'));
      } else {
        record.get('certId') && record.set('certId', null);
      }
    }
  }

  function handleLoad({ dataSet }:any) {
    const record = dataSet.current;
    record.init('isNormal', !record.get('certId'));
    const annotations = map(record.get('annotations') || [], (value, key) => ({
      value,
      key,
    }));
    annotationDs.loadData(isEmpty(annotations) ? [{}] : annotations);
  }

  function renderLookupUrl({ record }:any) {
    const domain = record.get('domain');
    if (domain && !record.get('isNormal')) {
      return {
        url: `/devops/v1/projects/${projectId}/certifications/active?env_id=${envId}&domain=${domain}`,
        method: 'post',
      };
    }
  }

  return ({
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    autoQueryAfterSubmit: false,
    children: {
      pathList: pathListDs,
      annotations: annotationDs,
    },
    transport: {
      read: {
        url: `/devops/v1/projects/${projectId}/ingress/${ingressId}`,
        method: 'get',
      },
      create: ({ data: [data] }:any) => {
        const postData = omit(data, '__id', '__status', 'annotations');
        formatAnnotation(postData, data);

        return ({
          url: `/devops/v1/projects/${projectId}/ingress`,
          method: 'post',
          data: postData,
        });
      },
      update: ({ data: [data] }:any) => {
        const postData:any = pick(data, 'name', 'domain', 'envId', 'appServiceId', 'certId');
        postData.domainId = ingressId;
        postData.pathList = pathListDs.toData();
        formatAnnotation(postData, data, annotationDs.toData());

        return ({
          url: `/devops/v1/projects/${projectId}/ingress/${ingressId}`,
          method: 'put',
          data: postData,
        });
      },
    },
    fields: [
      {
        name: 'name', type: 'string', label: formatMessage({ id: `${intlPrefix}.application.net.ingress` }), required: true, validator: checkName, maxLength: 40,
      },
      {
        name: 'domain', type: 'string', label: formatMessage({ id: `${intlPrefix}.domains` }), required: true, validator: checkDomain, maxLength: 50,
      },
      {
        name: 'isNormal', type: 'boolean', defaultValue: true, required: true, ignore: 'always',
      },
      {
        name: 'certId',
        type: 'string',
        textField: 'certName',
        valueField: 'id',
        label: formatMessage({ id: 'domain.form.cert' }),
        dynamicProps: {
          required: ({ record }:any) => !record.get('isNormal'),
          lookupAxiosConfig: renderLookupUrl,
        },
      },
      { name: 'envId', type: 'string', defaultValue: envId },
      { name: 'appServiceId', type: 'string', defaultValue: appServiceId },
    ],
    events: {
      load: handleLoad,
      update: handleUpdate,
    },
  });
};
