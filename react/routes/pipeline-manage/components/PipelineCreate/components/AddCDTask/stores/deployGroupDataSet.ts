import { DataSet } from 'choerodon-ui/pro';
import { FieldProps, FieldType, Record } from '@/interface';
import { deployAppCenterApiConfig, deployAppCenterApi } from '@/api/DeployAppCenter';
import { fieldMap, deployWayData } from './addCDTaskDataSetMap';

const appNameDataSet = new DataSet({
  autoQuery: false,
  paging: true,
  transport: {
    read: ({ data: { data } }) => deployAppCenterApiConfig.getDeployCenterAppList({
      rdupm_type: 'deployment',
      env_id: data,
    }),
  },
});

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appName: {
    name: 'appName',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
    textField: 'name',
    valueField: 'name',
    options: appNameDataSet,
  },
  appCode: {
    name: 'appCode',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
  },
});

const deployGroupDataSet = (ADDCDTaskDataSet: DataSet) => ({
  autoCreate: true,
  fields: Object.keys(mapping()).map((i) => {
    const item = mapping()[i];
    switch (i) {
      case 'appName': {
        item.validator = async (value: string) => {
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[0].value) {
            try {
              const res = await deployAppCenterApi.checkAppName(value);
              if (res) {
                return true;
              }
              return '名称重复';
            } catch (e) {
              return '校验出错';
            }
          } else {
            return true;
          }
        };
        break;
      }
      case 'appCode': {
        item.validator = async (value: string) => {
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[0].value) {
            try {
              const res = await deployAppCenterApi.checkAppCode(value);
              if (res) {
                return true;
              }
              return '编码重复';
            } catch (e) {
              return '校验出错';
            }
          } else {
            return true;
          }
        };
        break;
      }
      default: {
        break;
      }
    }
    return item;
  }),
  events: {
    update: ({ record, name, value }: {
      record: Record,
      name: string,
      value: string,
    }) => {
      switch (name) {
        case mapping().appName.name: {
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            const item = appNameDataSet.records.find((itemRecord: Record) => itemRecord.get('name') === value);
            if (item) {
              record.set(mapping().appCode.name as string, item.get('code'));
              record.getField(mapping().appCode.name)?.set('disabled', true);
            }
          } else {
            record.getField(mapping().appCode.name)?.set('disabled', false);
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

export { mapping, appNameDataSet };
export default deployGroupDataSet;
