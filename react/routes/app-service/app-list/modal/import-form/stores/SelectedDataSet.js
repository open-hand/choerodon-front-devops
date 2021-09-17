/* eslint-disable */
import { axios } from '@choerodon/boot';
import includes from 'lodash/includes';
import { appServiceApi } from '@/api';

export default ({ intlPrefix, formatMessage, projectId, importStore }) => {
  function handleUpdate({ dataSet, record, name, value, oldValue }) {
    if (name === 'name' || name === 'code') {
      dataSet.forEach((eachRecord) => {
        if (record.id !== eachRecord.id) {
          eachRecord.getField(name).checkValidity();
        }
      });
    }
  }

  function getLookUpConfig({ record }) {
    return appServiceVersionApiConfig.getLookUpConfig(record.get('id'));
  }
  async function checkCode(value, name, record) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      const dataSet = record.dataSet;
      const repeatRecord = dataSet.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('code') === value);
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

  async function checkName(value, name, record) {
    const pa = /^\S+$/;
    if (value && pa.test(value)) {
      const { listName } = importStore.getRepeatData || {};
      const dataSet = record.dataSet;
      const repeatRecord = dataSet.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('name') === value);
      if (repeatRecord) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (includes(listName, value)) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (!importStore.getSkipCheck) {
        try {
          importStore.setSkipCheck(true);
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
    autoQuery: false,
    selection: false,
    paging: false,
    transport: {},
    fields: [
      { name: 'id', type: 'string' },
      {
        name: 'name',
        type: 'string',
        validator: checkName,
        maxLength: 40,
        label: formatMessage({ id: `${intlPrefix}.name` }),
      },
      {
        name: 'code',
        type: 'string',
        validator: checkCode,
        maxLength: 30,
        label: formatMessage({ id: `${intlPrefix}.code` }),
      },
      {
        name: 'type',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.type` }),
      },
      {
        name: 'projectName',
        type: 'string',
        label: formatMessage({ id: `${intlPrefix}.project` }),
      },
      {
        name: 'share',
        type: 'boolean',
        label: formatMessage({ id: `${intlPrefix}.source` }),
      },
      {
        name: 'versionId',
        type: 'string',
        textField: 'version',
        valueField: 'id',
        dynamicProps: {
          lookupAxiosConfig: getLookUpConfig,
        },
        label: formatMessage({ id: `${intlPrefix}.version` }),
        required: true,
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
