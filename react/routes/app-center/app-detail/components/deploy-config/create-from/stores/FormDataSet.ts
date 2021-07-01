import {
  Record, DataSetProps, FieldIgnore, DataSet, RecordObjectProps,
} from '@/interface';
import AppCenterApi from '@/routes/app-center/apis';
import AppCenterDetailServices from '@/routes/app-center/app-detail/services';

interface FormProps {
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  deployConfigId?: string,
  envId: string,
  appServiceId?: string,
  appOptionDs: DataSet,
  appSelectDisabled?: boolean,
  appServiceName?: string,
}

export default ({
  formatMessage, projectId, envId, deployConfigId,
  appOptionDs, appServiceId, appSelectDisabled, appServiceName,
}: FormProps): DataSetProps => {
  const loadValue = async ({ id, record }: { id: string, record: Record }) => {
    const res = await AppCenterDetailServices.getAppServiceValue(projectId, id);
    res && record.set('value', res);
  };
  const handleUpdate = async ({ record, name, value }: any) => {
    if (name === 'appServiceId' && value) {
      const res = await AppCenterDetailServices.getAppServiceValue(projectId, value);
      res && record.set('value', res);
      loadValue({ id: value, record });
    }
  };

  const nameValidator = async (value: string, name: string, record: Record) => {
    const oldName = record.getPristineValue('name');
    if (deployConfigId && oldName && oldName === value) {
      return true;
    }
    try {
      const res = await AppCenterDetailServices.checkDeployName({ projectId, name: value, envId });
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
    dataKey: 'null',
    transport: {
      read: {
        url: AppCenterApi.createDeployConfig(projectId),
        method: 'get',
        params: { value_id: deployConfigId },
      },
      submit: ({ data: [data] }) => ({
        url: AppCenterApi.createDeployConfig(projectId),
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
    }, {
      name: 'value',
      required: true,
    }, {
      name: 'envId',
      required: true,
      defaultValue: envId,
    }],
    events: {
      load: ({ dataSet }: { dataSet: DataSet }) => {
        const record = dataSet.current;
        if (record) {
          record.init({
            appServiceId,
            envId,
          });
        }
      },
      create: ({ record }: RecordObjectProps) => {
        appServiceId && loadValue({ id: appServiceId, record });
      },
      update: handleUpdate,
    },
  };
};
