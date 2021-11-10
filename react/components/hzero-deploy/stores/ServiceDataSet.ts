/* eslint-disable import/no-anonymous-default-export */
import { CONSTANTS } from '@choerodon/master';
import { Record } from '@/interface';
import { appServiceInstanceApi, deployAppCenterApi } from '@/api';

const {
  LCLETTER_NUM,
} = CONSTANTS;
interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

export default ({
  formatMessage,
  intlPrefix,
}: FormProps): any => {
  async function checkName(value: any, name: string, record: Record) {
    if (record.get('envId')) {
      try {
        const res = await deployAppCenterApi.checkAppName(
          value,
          undefined,
          undefined,
          record.get('envId'),
        );
        if ((res && res.failed) || !res) {
          return formatMessage({ id: 'checkNameExist' });
        }
        return true;
      } catch (err) {
        return formatMessage({ id: 'checkNameFailed' });
      }
    }
    return '请先选择环境';
  }

  async function checkCode(value: any, name: string, record: Record) {
    const flag = LCLETTER_NUM.test(value);
    if (!flag) {
      return '编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾';
    }
    if (record.get('envId')) {
      try {
        const res = await deployAppCenterApi.checkAppCode(
          value,
          undefined,
          undefined,
          record.get('envId'),
        );
        if ((res && res.failed) || !res) {
          return formatMessage({ id: 'checkCodeExist' });
        }
        return true;
      } catch (err) {
        return formatMessage({ id: 'checkCodeFailed' });
      }
    }
    return '请先选择环境';
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
        name: 'appCode',
        label: formatMessage({ id: 'appCode' }),
        required: true,
        validator: checkCode,
        maxLength: 60,
      },
      {
        name: 'appName',
        label: formatMessage({ id: 'appName' }),
        validator: checkName,
        required: true,
        maxLength: 60,
      },
      { name: 'values' },
    ],
  });
};
