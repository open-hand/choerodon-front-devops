import { DataSet } from 'choerodon-ui/pro';
import JSONbig from 'json-bigint';
import { hostApi, hostApiConfig } from '@/api';
import { Record } from '@/interface';
import addCDTaskDataSetMap, { fieldMap, deployWayData } from './addCDTaskDataSetMap';

const hostJarDataSet = (ADDCDTaskDataSet: DataSet, HotJarOptionsDataSet: any, jobDetail: any) => ({
  autoCreate: true,
  fields: [{
    name: 'appName',
    type: 'string',
    label: '应用名称',
    required: true,
    textField: 'name',
    valueField: 'name',
    options: HotJarOptionsDataSet,
    validator: async (value: string, type: string, record: any) => {
      const isCreate = ADDCDTaskDataSet
        ?.current?.get(fieldMap.deployWay.name) === deployWayData[0].value;
      if (isCreate) {
        const flag = await hostApi.checkAppName(value);
        if (flag) {
          return true;
        }
        return '应用名称已重复';
      }
      return true;
    },
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
    load: async ({ dataSet }: any) => {
      const appName = dataSet?.current?.get('appName');
      let metadata: any = '';
      let hostDeployType = '';
      if (jobDetail) {
        metadata = JSONbig.parse(jobDetail.metadata.replace(/'/g, '"'));
        hostDeployType = metadata?.hostDeployType;
      }

      HotJarOptionsDataSet.setQueryParameter('data', hostDeployType || ADDCDTaskDataSet?.current?.get('hostDeployType'));
      await HotJarOptionsDataSet.query();
      const value = HotJarOptionsDataSet?.toData()
        .find((i: any) => i.name === appName)?.dockerComposeValueDTO?.value;
      ADDCDTaskDataSet?.current?.set(fieldMap.dockerCompose.name, value);
    },
    update: ({ name, value, record }: {
      name: string,
      value: string,
      record: Record,
    }) => {
      switch (name) {
        case 'appName': {
          const options: any = record?.getField('appName')?.options;
          const item = options?.records.find((option: Record) => option.get('name') === value);
          if (item) {
            record?.set('appCode', item.get('code'));
            record?.getField('appCode')?.set('disabled', true);
            record?.set('appId', item.get('id'));
          }
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            ADDCDTaskDataSet.current?.set(addCDTaskDataSetMap.host, record?.getField('appName')?.options?.records?.find((i) => i.get('name') === value)?.get('hostId'));
          }
          if (ADDCDTaskDataSet.current?.get('type') === 'cdHost'
            && ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value
          ) {
            const dockerComposeValue = options?.toData().find(
              (i: any) => i?.name === value,
            )?.dockerComposeValueDTO?.value;
            if (dockerComposeValue) {
              ADDCDTaskDataSet?.current?.set(fieldMap.dockerCompose.name, dockerComposeValue);
            }
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

export { hostJarDataSet };
