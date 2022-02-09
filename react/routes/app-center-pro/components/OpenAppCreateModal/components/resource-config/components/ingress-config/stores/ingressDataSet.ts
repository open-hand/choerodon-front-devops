import some from 'lodash/some';
import { DataSet } from 'choerodon-ui/pro';
import { ingressApi } from '@/api/Ingress';
import { DataSetProps, FieldProps } from '@/interface';
import { certificationsApiConfig } from '@/api/Certifications';

async function checkName(value: string, name: string, record: any, envId: any) {
  if (!envId) {
    return;
  }
  const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
  if (value) {
    if (p.test(value)) {
      try {
        const res = await ingressApi.checkName(envId, value);
        if (res && !res.failed) {
          // eslint-disable-next-line consistent-return
          return true;
        }
        // eslint-disable-next-line consistent-return
        return '名称已存在';
      } catch (e) {
        // eslint-disable-next-line consistent-return
        return '名称重名校验失败，请稍后再试';
      }
    } else {
      // eslint-disable-next-line consistent-return
      return '由小写字母，数字和 - 组成，以字母、数字开始和结束';
    }
  }
}

function checkDomain(value: string) {
  if (!value) {
    return;
  }
  const pattern = /^(\*\.)?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
  if (!pattern.test(value)) {
    // eslint-disable-next-line consistent-return
    return '由小写字母，数字， 中划线和 . 组成，以字母、数字开始和结束， 且支持 *. 开头进行通配';
  }
}

function isRequired({ record }: any) {
  const hasValue = record.get('name') || record.get('domain') || record.get('certId');
  const pathDirty = some(record.getCascadeRecords('pathList'), (pathRecord) => pathRecord.dirty);
  const annotationDirty = some(record.getCascadeRecords('annotations'), (annotationRecord) => annotationRecord.dirty);
  return !!hasValue || pathDirty || annotationDirty;
}

function renderLookupUrl({ record }: any) {
  const parentRecord = record?.cascadeParent;
  if (!parentRecord) {
    return;
  }
  const envId = parentRecord.get('environmentId');
  const domain = record.get('domain');
  if (domain && !record.get('isNormal')) {
    // eslint-disable-next-line consistent-return
    return certificationsApiConfig.getActive(envId, domain);
  }
}

const ingressDataSet = (PathListDataSet: any, envId: any): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  fields: [{
    name: 'name',
    type: 'string',
    label: '域名名称',
    validator: async (value: any, name: any, record: any) => {
      const res = await checkName(value, name, record, envId);
      return res;
    },
    maxLength: 40,
    dynamicProps: {
      required: isRequired,
    },
  }, {
    name: 'isNormal',
    type: 'boolean',
    defaultValue: true,
    ignore: 'always',
    label: '协议类型',
    dynamicProps: {
      required: isRequired,
    },
    textField: 'name',
    valueField: 'value',
    options: new DataSet({
      data: [{
        value: true,
        name: '普通协议',
      }, {
        value: false,
        name: '加密协议',
      }],
    }),
  }, {
    name: 'domain',
    type: 'string',
    label: '域名地址',
    validator: checkDomain,
    maxLength: 50,
    dynamicProps: {
      required: isRequired,
    },
  }, {
    name: 'certId',
    type: 'string',
    textField: 'certName',
    valueField: 'id',
    label: '域名证书',
    dynamicProps: {
      required: ({ record }) => isRequired({ record }) && !record.get('isNormal'),
      lookupAxiosConfig: renderLookupUrl,
    },
  }] as FieldProps[],
  events: {
    update: ({ value, name, record }: any) => {
      switch (name) {
        case 'name': {
          PathListDataSet.current.getField('servicePort').set('required', value);
          PathListDataSet.current.getField('serviceName').set('required', value);
          break;
        }
        case 'domain': {
          PathListDataSet.current.getField('servicePort').set('required', value);
          PathListDataSet.current.getField('serviceName').set('required', value);
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export default ingressDataSet;
