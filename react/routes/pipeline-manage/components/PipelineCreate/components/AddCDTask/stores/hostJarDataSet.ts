import { DataSet } from 'choerodon-ui/pro';
import { hostApiConfig } from '@/api';
import { Record } from '@/interface';
import addCDTaskDataSetMap, { fieldMap, deployWayData } from './addCDTaskDataSetMap';

const hostJarDataSet = (ADDCDTaskDataSet: DataSet) => ({
  autoCreate: true,
  fields: [{
    name: 'appName',
    type: 'string',
    label: '应用名称',
    required: true,
    textField: 'name',
    valueField: 'name',
    options: new DataSet(hotJarOptionsDataSet()),
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
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            ADDCDTaskDataSet.current?.set(addCDTaskDataSetMap.host, record.getField('appName')?.options?.records?.find((i) => i.get('name') === value)?.get('hostId'));
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

const hotJarOptionsDataSet = () => ({
  autoQuery: true,
  transport: {
    read: () => hostApiConfig.loadHostsAppList(),
  },
});

export { hotJarOptionsDataSet, hostJarDataSet };
