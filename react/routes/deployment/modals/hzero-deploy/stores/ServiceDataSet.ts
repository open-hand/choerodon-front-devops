import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { RecordObjectProps, DataSetProps, FieldType } from '@/interface';
import { axios } from '@choerodon/boot';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
}

function handleUpdate({ name, record }: { name: string, record: any }) {
  if (name === 'authType') {
    record.get('password') && record.set('password', null);
  }
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
}: FormProps): DataSetProps => {
  async function checkName(value, name, record) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      if (!record.get('environmentId')) return true;
      try {
        const res = await axios.get(`/devops/v1/projects/${projectId}/app_service_instances/check_name?instance_name=${value}&env_id=${record.get('environmentId')}`);
        if ((res && res.failed) || !res) {
          return formatMessage({ id: 'checkNameExist' });
        }
        return true;
      } catch (err) {
        return formatMessage({ id: 'checkNameFailed' });
      }
    } else {
      return formatMessage({ id: 'checkNameReg' });
    }
  }

  return ({
    autoCreate: true,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: false,
    fields: [
      {
        name: 'serviceVersionId',
        textField: 'version',
        valueField: 'id',
        label: formatMessage({ id: `${intlPrefix}.version.service` }),
        required: true,
        // options: envOptionsDs,
      },
      {
        name: 'instanceName',
        label: formatMessage({ id: 'instanceName' }),
        required: true,
        validator: checkName,
        maxLength: 60,
      },
      { name: 'values' },
      {
        name: 'hzeroServiceId',
        textField: 'version',
        valueField: 'id',
        required: true,
      },
    ],
  });
};
