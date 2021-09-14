/* eslint-disable import/no-anonymous-default-export */
import omit from 'lodash/omit';
import { DataSet } from 'choerodon-ui/pro';
import {
  DataSetProps, FieldType, FieldIgnore,
} from '@/interface';
import { middlewareConfigApi } from '@/api/Middleware';
import { appServiceInstanceApiConfig } from '@/api';

interface FormProps {
  intlPrefix: string;
  formatMessage(arg0: object, arg1?: object): string;
  projectId: number;
  versionsDs: DataSet;
  isMiddleware: boolean;
  isHzero: boolean;
  instanceId: string
}

export default ({
  versionsDs,
  isMiddleware,
  instanceId,
}: FormProps): DataSetProps => {
  // eslint-disable-next-line no-shadow
  const getUpgradeAppUrl = (data: any, instanceId: string) => {
    if (isMiddleware) {
      return middlewareConfigApi.upgradeApp(data, instanceId);
    }
    return appServiceInstanceApiConfig.updateMarketAppService(instanceId, data);
  };

  return {
    autoCreate: true,
    autoQuery: false,
    selection: false,
    transport: {
      create: ({ data: [data] }) => {
        const res = omit(data, ['__id', '__status']);
        return getUpgradeAppUrl(res, instanceId);
      },
    },
    fields: [
      {
        name: 'marketAppVersion',
        type: 'string' as FieldType,
        label: '当前版本',
        ignore: 'always' as FieldIgnore,
      },
      {
        name: 'instanceId',
        type: 'string' as FieldType,
        label: 'instanceId',
        defaultValue: instanceId,
        ignore: 'always' as FieldIgnore,
      },
      {
        name: 'marketDeployObjectId',
        textField: 'marketServiceVersion',
        valueField: 'id',
        label: '变更版本',
        options: versionsDs,
      },
      { name: 'values', type: 'string' as FieldType },
    ],
  };
};
