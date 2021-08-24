/* eslint-disable */
import { axios } from '@choerodon/boot';
import includes from 'lodash/includes';
import { DataSet } from 'choerodon-ui/pro';
import {appServiceApi} from '@/api/AppService';
const TypeOptionDs = () => {
  return ({
    fields: [
      { name: 'text', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    data: [{
      text: '普通服务',
      value: '普通服务',
    }, {
      text: '测试服务',
      value: '测试服务',
    }],
  })
};
const GitlabSelectedDs = ({ intlPrefix, formatMessage, projectId, importStore }: any) => {
  function handleUpdate({ dataSet, record, name }: any) {
    if (name === 'name' || name === 'code') {
      dataSet.forEach((eachRecord: any) => {
        if (record.id !== eachRecord.id) {
          eachRecord.getField(name).checkValidity();
        }
      });
    }
  }

  async function checkCode(value: any, name: any, record: any) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/
    if (value && pa.test(value)) {
      const dataSet = record.dataSet;
      const repeatRecord = dataSet.find((eachRecord: any) => eachRecord.id !== record.id && eachRecord.get('code') === value);
      const { listCode } = importStore.getRepeatData || {};
      if (repeatRecord) {
        return formatMessage({ id: 'checkCodeExist' });
      }
      if (includes(listCode, value)) {
        return formatMessage({ id: 'checkCodeExist' });
      }
      if (!importStore.getSkipCheck) {
        try {
          const res = await appServiceApi.checkCode(value);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkCodeExist' });
          }
        } catch (err) {
          return formatMessage({ id: 'checkCodeFailed' });
        }
      }
    } else {
      return formatMessage({ id: 'checkCodeReg' });
    }
  }

  async function checkName(value: any, name: any, record: any) {
    const pa = /^\S+$/;
    if (pa.test(value)) {
      const { listName } = importStore.getRepeatData || {};
      const dataSet = record.dataSet;
      const repeatRecord = dataSet.find((eachRecord: any) => eachRecord.id !== record.id && eachRecord.get('name') === value);
      const repeatName = dataSet.find((eachRecord: any) => eachRecord.id !== record.id && eachRecord.get('serverName') === value);
      if (repeatRecord) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (repeatName) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (includes(listName, value)) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (!importStore.getSkipCheck) {
        try {
          const res = await appServiceApi.checkName(value);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkNameExist' });
          }
        } catch (err) {
          return formatMessage({ id: `${intlPrefix}.name.failed` });
        }
      }
    } else {
      return formatMessage({ id: 'nameCanNotHasSpaces' });
    }
  }

  return ({
    selection: false,
    paging: false,
    transport: {},
    datatojson: true,
    expandField: 'expand',
    fields: [
      { name: 'id', type: 'string' },
      {
        name: 'serverName',
        type: 'string',
        validator: checkName,
        required: true,
        maxLength: 40,
        label: formatMessage({ id: `${intlPrefix}.name` }),
      },
      {
        name: 'name',
        type: 'string',
        validator: checkCode,
        maxLength: 30,
        label: formatMessage({ id: `${intlPrefix}.code` }),
      },
      {
        name: 'type',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.type` }),
        defaultValue: '普通服务',
      },
      { name: 'lastActivityAt', type: 'string', label: formatMessage({ id: 'updateDate' }) },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
export { TypeOptionDs, GitlabSelectedDs };
