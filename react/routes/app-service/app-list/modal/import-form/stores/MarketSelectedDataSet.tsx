import { axios } from '@choerodon/boot';
import includes from 'lodash/includes';
import {
  DataSetProps, Record, DataSet, FieldType,
} from '@/interface';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: string,
  importStore: any,
}

interface UpdateProps {
  dataSet: DataSet,
  record: Record,
  name: string,
  value: any,
  oldValue: any,
}

export default ({
  intlPrefix, formatMessage, projectId, importStore,
}: TableProps): DataSetProps => {
  function handleUpdate({
    dataSet, record, name, oldValue, value,
  }: UpdateProps) {
    if (name === 'name' || name === 'code') {
      importStore.setSkipCheck(false);
      dataSet.forEach((eachRecord: Record) => {
        if (record.id !== eachRecord.id
          && (eachRecord.get(name) === oldValue || eachRecord.get(name) === value)
        ) {
          eachRecord.getField(name)?.checkValidity();
        }
      });
    }
  }

  async function checkCode(value: string, name: string, record: Record) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      const { dataSet } = record;
      const repeatRecord = dataSet?.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('code') === value);
      const { listCode } = importStore.getRepeatData || {};
      if (repeatRecord) {
        return formatMessage({ id: 'checkCodeExist' });
      }
      if (includes(listCode, value)) {
        return formatMessage({ id: 'checkCodeExist' });
      }
      if (!importStore.getSkipCheck) {
        try {
          const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/check_code?code=${value}`);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkCodeExist' });
          }
        } catch (err) {
          return formatMessage({ id: 'checkCodeFailed' });
        }
      }
      return true;
    }
    return formatMessage({ id: 'checkCodeReg' });
  }

  async function checkName(value: string, name: string, record: Record) {
    const pa = /^\S+$/;
    if (value && pa.test(value)) {
      const { listName } = importStore.getRepeatData || {};
      const { dataSet } = record;
      const repeatRecord = dataSet?.find((eachRecord) => eachRecord.id !== record.id && eachRecord.get('name') === value);
      if (repeatRecord) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (includes(listName, value)) {
        return formatMessage({ id: 'checkNameExist' });
      }
      if (!importStore.getSkipCheck) {
        try {
          importStore.setSkipCheck(true);
          const res = await axios.get(`/devops/v1/projects/${projectId}/app_service/check_name?name=${encodeURIComponent(value)}`);
          if ((res && res.failed) || !res) {
            return formatMessage({ id: 'checkNameExist' });
          }
        } catch (err) {
          return formatMessage({ id: `${intlPrefix}.name.failed` });
        }
      }
      return true;
    }
    return formatMessage({ id: 'nameCanNotHasSpaces' });
  }

  return ({
    autoQuery: false,
    selection: false,
    paging: false,
    transport: {},
    fields: [
      {
        name: 'name',
        type: 'string' as FieldType,
        validator: checkName,
        maxLength: 40,
        label: formatMessage({ id: `${intlPrefix}.name` }),
      },
      {
        name: 'code',
        type: 'string' as FieldType,
        validator: checkCode,
        maxLength: 30,
        label: formatMessage({ id: `${intlPrefix}.code` }),
      },
      {
        name: 'versionName',
        type: 'string' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.versionName` }),
      },
      {
        name: 'sourceProject',
        type: 'string' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.sourceProject` }),
      },
      {
        name: 'sourceApp',
        type: 'string' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.sourceApp` }),
      },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
