import { FieldProps } from 'choerodon-ui/pro/lib/data-set/field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const mapping: {
  [key: string]: FieldProps;
} = {
  appName: {
    name: 'appName',
    type: 'string' as FieldType,
    label: '应用名称',
  },
};

const appInfoDataSet = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default appInfoDataSet;
