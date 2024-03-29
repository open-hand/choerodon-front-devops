import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps, FieldType, Record } from '@/interface';
import { deployValueConfigApi } from '@/api/DeployValue';
import { fieldMap, deployWayData } from './addCDTaskDataSetMap';
import { deployAppCenterApi, deployAppCenterApiConfig, hostApi } from '@/api';

const {
  LCLETTER_NUMREGEX,
} = CONSTANTS;

const appNameChartDataSet = new DataSet({
  autoQuery: false,
  paging: true,
  transport: {
    read: ({ data: { data } }) => (data?.envId ? ({
      ...deployAppCenterApiConfig
        .getAppFromChart(data.envId, data.appServiceId),
      data: null,
    }) : undefined),
  },
});

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appId: {
    textField: 'name',
    valueField: 'id',
    name: 'appId',
    label: '应用名称',
    options: appNameChartDataSet,
  },
  appName: {
    name: 'appName',
    type: 'string' as FieldType,
    label: '应用名称',
    maxLength: 64,
  },
  appCode: {
    name: 'appCode',
    type: 'string' as FieldType,
    label: '应用编码',
    required: true,
    maxLength: 64,
    // validator: (value) => {
    //  debugger;
    //  if (LCLETTER_NUMREGEX.regex.test(value)) {
    //    return true;
    //  }
    //  return LCLETTER_NUMREGEX.text;
    // },
  },
  deployConfig: {
    name: 'valueId',
    type: 'string' as FieldType,
    // label: '部署配置',
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
    read: ({ data: { data } }) => {
      if (!data?.envId) {
        return [];
      }
      return ({
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
      });
    },
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
              const res = await deployAppCenterApi.checkAppName(value, undefined, undefined, ADDCDTaskDataSet.current.get('envId'));
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
          let flag: any = true;
          if (!LCLETTER_NUMREGEX.regex.test(value)) {
            flag = LCLETTER_NUMREGEX.text;
          }
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[0].value) {
            try {
              const res = await deployAppCenterApi.checkAppCode(value, undefined, undefined, ADDCDTaskDataSet.current.get('envId'));
              if (!res) {
                flag = '编码重复';
              }
            } catch (e) {
              flag = '校验出错';
            }
          }
          return flag;
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
          record?.set(mapping().value.name as string, item?.get('value'));
          break;
        }
        case mapping().appId.name: {
          if (ADDCDTaskDataSet.current?.get(fieldMap.deployWay.name) === deployWayData[1].value) {
            const item = appNameChartDataSet.records.find((itemRecord: Record) => itemRecord.get('id') === value);
            if (item) {
              record?.set(mapping().appCode.name as string, item.get('code'));
              record?.getField(mapping().appCode.name)?.set('disabled', true);
            }
          } else {
            record?.getField(mapping().appCode.name)?.set('disabled', false);
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
