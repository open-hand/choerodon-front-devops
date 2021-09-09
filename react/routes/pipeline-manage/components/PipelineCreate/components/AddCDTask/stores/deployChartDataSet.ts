import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps, FieldType, Record } from '@/interface';
import { deployValueConfigApi } from '@/api/DeployValue';
import { fieldMap, deployWayData } from './addCDTaskDataSetMap';
import { deployAppCenterApi, deployAppCenterApiConfig } from '@/api';

const {
  LCLETTER_NUMREGEX,
} = CONSTANTS;

const appNameChartDataSet = new DataSet({
  autoQuery: false,
  paging: true,
  transport: {
    read: ({ data: { data } }) => ({
      ...deployAppCenterApiConfig
        .getAppFromChart(data.envId, data.appServiceId),
      data: null,
    }),
  },
});

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appName: {
    textField: 'name',
    valueField: 'name',
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
    maxLength: 64,
    options: appNameChartDataSet,
  },
  appCode: {
    name: 'code',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
    maxLength: 64,
    validator: (value) => {
      if (LCLETTER_NUMREGEX.regex.test(value)) {
        return true;
      }
      return LCLETTER_NUMREGEX.text;
    },
  },
  deployConfig: {
    name: 'valueId',
    type: 'string' as FieldType,
    label: '部署配置',
    required: true,
    options: deployConfigDataSet,
    textField: 'name',
    valueField: 'id',
  },
  value: {
    name: 'value',
    type: 'string' as FieldType,
  },
});

const deployConfigDataSet = new DataSet({
  paging: false,
  autoQuery: false,
  transport: {
    read: ({ data: { data } }) => ({
      ...deployValueConfigApi.getValueIdList(data),
      transformResponse: (res) => {
        let newRes = res;
        try {
          newRes = JSON.parse(res);
          newRes.push({
            name: '创建部署配置',
            id: 'create',
          });
          return newRes;
        } catch (e) {
          newRes.push({
            name: '创建部署配置',
            id: 'create',
          });
          return newRes;
        }
      },
    }),
  },
});

const deployChartDataSet = (ADDCDTaskDataSet: DataSet) => ({
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
    update: ({ name, record, value }: {
        name: string
        record: Record,
        value: string,
      }) => {
      switch (name) {
        case mapping().deployConfig.name: {
          const options = record?.getField(mapping().deployConfig.name)?.options;
          const item = options?.records.find((i) => i.get('id') === value);
          record.set(mapping().value.name as string, item?.get('value'));
          break;
        }
        case mapping().appName.name: {
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            const item = appNameChartDataSet.records.find((itemRecord: Record) => itemRecord.get('name') === value);
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

export default deployChartDataSet;

export { mapping, deployConfigDataSet, appNameChartDataSet };
