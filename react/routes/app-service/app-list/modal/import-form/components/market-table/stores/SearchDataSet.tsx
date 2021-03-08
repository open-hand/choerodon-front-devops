import { DataSetProps, FieldType, Record } from '@/interface';
import { DataSet } from 'choerodon-ui/pro';
import isEmpty from 'lodash/isEmpty';

interface TableProps {
  intlPrefix: string,
  formatMessage(arg0: object, arg1?: object): string,
  allAppVersionDs: DataSet,
  allAppDs: DataSet,
  tableDs: DataSet,
}
interface UpdateProps {
  name: string,
  value: any,
  record: Record,
}

interface UpdateFuncProps extends UpdateProps{
  allAppVersionDs: DataSet,
  tableDs: DataSet,
}

function handleUpdate({
  name, value, record, allAppVersionDs, tableDs,
}: UpdateFuncProps) {
  if (name === 'app') {
    const { id = '', appVersionVOS = [] } = value || {};
    tableDs.setQueryParameter('market_app_id', id);
    allAppVersionDs.loadData(appVersionVOS || []);
    if (isEmpty(appVersionVOS)) {
      record.set('market_app_version_id', null);
      tableDs.setQueryParameter('market_app_version_id', id);
    }
  } else {
    tableDs.setQueryParameter(name, value);
  }
  tableDs.query();
}

export default ({
  intlPrefix, formatMessage, allAppVersionDs, allAppDs, tableDs,
}: TableProps): DataSetProps => ({
  autoCreate: true,
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'app',
      type: 'object' as FieldType,
      textField: 'name',
      valueField: 'id',
      label: formatMessage({ id: `${intlPrefix}` }),
      options: allAppDs,
    },
    {
      name: 'market_app_version_id',
      textField: 'versionNumber',
      valueField: 'id',
      label: formatMessage({ id: `${intlPrefix}.version` }),
      options: allAppVersionDs,
    },
    { name: 'params', type: 'string' as FieldType },
  ],
  events: {
    update: ({ name, value, record }: UpdateProps) => handleUpdate({
      name, value, record, allAppVersionDs, tableDs,
    }),
  },
});
