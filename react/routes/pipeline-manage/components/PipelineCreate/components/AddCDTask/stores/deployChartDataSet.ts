import { DataSet } from 'choerodon-ui/pro';
import { CONSTANTS } from '@choerodon/master';
import { FieldProps, FieldType } from '@/interface';

const {
  LCLETTER_NUMREGEX,
} = CONSTANTS;

const mapping = (): {
  [key: string]: FieldProps
} => ({
  appName: {
    name: 'appName',
    type: 'string' as FieldType,
    label: '应用名称',
    required: true,
    maxLength: 64,
  },
  appCode: {
    name: 'appCode',
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
    name: 'deployConfig',
    type: 'string' as FieldType,
    label: '部署配置',
    required: true,
  },
});

const deployChartDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping()).map((i) => mapping()[i]),
});

export default deployChartDataSet;

export { mapping };
