import omit from 'lodash/omit';
import { DataSet } from 'choerodon-ui/pro';
import {
  DataSetProps, Record, FieldType, FieldIgnore,
} from '@/interface';

interface FormProps {
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  projectId: number,
  versionsDs: DataSet,
  valueDs: DataSet,
}

interface updateProps {
  name: string,
  value: any,
  record: Record
}

export default ({
  formatMessage, intlPrefix, projectId, versionsDs, valueDs,
}: FormProps): DataSetProps => {
  async function handleUpdate({ name, value, record }: updateProps) {
    if (name === 'marketDeployObjectId' && value) {
      valueDs.setQueryParameter('market_deploy_object_id', value);
      await valueDs.query();
      record.set('values', valueDs.current ? valueDs.current.get('yaml') : '');
    }
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    transport: {
      create: ({ data: [data] }) => {
        const res = omit(data, ['__id', '__status']);
        if (!res.values) {
          res.values = valueDs && valueDs.current ? valueDs.current.get('yaml') : '';
        }
        return ({
          url: `/devops/v1/projects/${projectId}/app_service_instances/market/instances/${data.instanceId}`,
          method: 'put',
          data: res,
        });
      },
    },
    fields: [
      {
        name: 'marketDeployObjectId',
        textField: 'marketServiceVersion',
        valueField: 'id',
        label: formatMessage({ id: `${intlPrefix}.marketService.version` }),
        options: versionsDs,
      },
      {
        name: 'marketServiceName',
        type: 'string' as FieldType,
        label: formatMessage({ id: `${intlPrefix}.marketService` }),
        ignore: 'always' as FieldIgnore,
      },
      { name: 'values', type: 'string' as FieldType },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
