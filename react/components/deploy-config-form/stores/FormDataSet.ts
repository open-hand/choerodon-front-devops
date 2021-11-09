/* eslint-disable import/no-anonymous-default-export */
import JSONbig from 'json-bigint';
import {
  Record, DataSetProps, FieldIgnore, DataSet, RecordObjectProps,
} from '@/interface';
import DeployConfigApis from '../apis';
import DeployConfigServices from '../services';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  deployConfigId?: string,
  envId: string,
  appServiceId?: string,
  appOptionDs: DataSet,
  appSelectDisabled?: boolean,
  appServiceName?: string,
  setValueLoading:CallableFunction,
}

export default ({
  formatMessage, projectId, envId, deployConfigId,
  appOptionDs, appServiceId, appSelectDisabled, appServiceName, setValueLoading,
}: FormProps): DataSetProps => {
  const loadValue = async ({ id, record }: { id: string, record: Record }) => {
    !deployConfigId && setValueLoading(true);
    const res = await DeployConfigServices.getAppServiceValue(projectId, id);
    res && record.set('oldValue', res);
    res && record.set('value', res);
    !deployConfigId && setValueLoading(false);
  };
  const handleUpdate = async ({ record, name, value }: any) => {
    if (name === 'appServiceId' && value) {
      loadValue({
        id: value,
        record,
      });
    }
  };

  const nameValidator = async (value: string, name: string, record: Record) => {
    const oldName = record.getPristineValue('name');
    if (deployConfigId && oldName && oldName === value) {
      return true;
    }
    try {
      const res = await DeployConfigServices.checkDeployName({ projectId, name: value, envId });
      if ((res && res.failed) || !res) {
        return formatMessage({ id: 'checkNameExist' });
      }
      return true;
    } catch (err) {
      return formatMessage({ id: 'checkNameFailed' });
    }
  };

  return {
    autoQuery: false,
    autoCreate: false,
    autoQueryAfterSubmit: false,
    paging: false,
    dataToJSON: undefined,
    transport: {
      read: {
        url: DeployConfigApis.createDeployConfig(projectId),
        method: 'get',
        params: { value_id: deployConfigId },
        transformResponse: (res:any) => {
          const newRes = JSONbig.parse(res);
          newRes.oldValue = newRes.value;
          return newRes;
        },
      },
      submit: ({ data: [data] }) => ({
        url: DeployConfigApis.createDeployConfig(projectId),
        method: 'post',
        data: { ...data, envId },
      }),
    },
    fields: [{
      name: 'name',
      label: '部署配置名称',
      required: true,
      maxLength: 30,
      validator: nameValidator,
    }, {
      name: 'description',
      required: true,
      label: formatMessage({ id: 'description' }),
      maxLength: 200,
    }, {
      name: 'appServiceId',
      textField: 'appServiceName',
      valueField: 'appServiceId',
      label: formatMessage({ id: 'appService' }),
      required: true,
      defaultValue: appServiceId,
      options: appOptionDs,
    }, {
      name: 'appServiceName',
      label: formatMessage({ id: 'appService' }),
      readOnly: true,
      ignore: 'always' as FieldIgnore,
      defaultValue: appSelectDisabled ? appServiceName : null,
    },
    {
      name: 'value',
      required: true,
    },
    {
      name: 'oldValue',
    },
    {
      name: 'envId',
      required: true,
      defaultValue: envId,
    }],
    events: {
      create: ({ record }: RecordObjectProps) => {
        appServiceId && loadValue({ id: appServiceId, record });
      },
      update: handleUpdate,
    },
  };
};
