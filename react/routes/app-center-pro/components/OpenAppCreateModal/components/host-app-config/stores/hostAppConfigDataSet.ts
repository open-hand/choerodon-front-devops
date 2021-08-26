import { DataSet } from 'choerodon-ui/pro';
import { DataSetProps, FieldProps, FieldType } from '@/interface';
import { productSourceData } from '@/routes/app-center-pro/components/OpenAppCreateModal/components/container-config/stores/conGroupDataSet';

const mapping: {
  [key: string]: FieldProps
} = {
  host: {
    name: 'host',
    type: 'string' as FieldType,
    label: '主机',
  },
  jarSource: {
    name: 'jarSource',
    type: 'string' as FieldType,
    options: new DataSet({
      data: productSourceData,
    }),
    defaultValue: productSourceData[0].value,
  },
};

const hostAppConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default hostAppConfigDataSet;

export { mapping };
