import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps, FieldType, Record } from '@/interface';
import { deployValueConfigApi } from '@/api/DeployValue';

const {
  LCLETTER_NUMREGEX,
} = CONSTANTS;

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appName: {
    name: 'name',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
    maxLength: 64,
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

const deployChartDataSet = (useStore: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping()).map((i) => mapping()[i]),
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
        default: {
          break;
        }
      }
    },
  },
});

export default deployChartDataSet;

export { mapping, deployConfigDataSet };
