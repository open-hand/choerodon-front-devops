import { DataSet } from 'choerodon-ui/pro';
import { hostApiConfig } from '@/api';
import { Record } from '@/interface';

const hostJarDataSet = () => ({
  autoCreate: true,
  fields: [{
    name: 'appName',
    type: 'string',
    label: '应用名称',
    required: true,
    textField: 'name',
    valueField: 'name',
    options: new DataSet({
      autoQuery: true,
      transport: {
        read: () => hostApiConfig.loadHostsAppList(),
      },
    }),
  }, {
    name: 'appCode',
    type: 'string',
    label: '应用编码',
    required: true,
  }, {
    name: 'appId',
    type: 'string',
  }],
  events: {
    update: ({ name, value, record }: {
      name: string,
      value: string,
      record: Record,
    }) => {
      switch (name) {
        case 'appName': {
          const options = record.getField('appName')?.options;
          const item = options?.records.find((option: Record) => option.get('name') === value);
          if (item) {
            record.set('appCode', item.get('code'));
            record.getField('appCode')?.set('disabled', true);
            record.set('appId', item.get('id'));
          }

          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export default hostJarDataSet;
