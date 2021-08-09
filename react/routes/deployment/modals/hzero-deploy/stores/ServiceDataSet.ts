import { DataSet } from 'choerodon-ui/pro';
import omit from 'lodash/omit';
import { Record, DataSetProps, FieldType } from '@/interface';
import { axios } from '@choerodon/boot';
import { appServiceInstanceApi } from '@/api';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: number,
}

export default ({
  formatMessage,
  intlPrefix,
  projectId,
}: FormProps): DataSetProps => {
  async function checkName(value: any, name: string, record: Record) {
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      const envId = record?.cascadeParent?.get('envId');
      if (!envId) return true;
      try {
        const res = await appServiceInstanceApi.checkName(envId, value);
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
    autoCreate: false,
    selection: false,
    autoQueryAfterSubmit: false,
    paging: false,
    fields: [
      {
        name: 'marketServiceVersion',
        label: formatMessage({ id: `${intlPrefix}.version.service` }),
        required: true,
      },
      {
        name: 'instanceName',
        label: formatMessage({ id: 'instanceName' }),
        required: true,
        validator: checkName,
        maxLength: 60,
      },
      { name: 'values' },
    ],
  });
};
