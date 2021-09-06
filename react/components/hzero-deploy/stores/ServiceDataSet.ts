/* eslint-disable import/no-anonymous-default-export */
import { Record } from '@/interface';
import { appServiceInstanceApi } from '@/api';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

export default ({
  formatMessage,
  intlPrefix,
}: FormProps): any => {
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
        label: formatMessage({ id: 'appCode' }),
        required: true,
        validator: checkName,
        maxLength: 60,
      },
      {
        name: 'appName',
        label: formatMessage({ id: 'appName' }),
        required: true,
        maxLength: 60,
      },
      { name: 'values' },
    ],
  });
};
