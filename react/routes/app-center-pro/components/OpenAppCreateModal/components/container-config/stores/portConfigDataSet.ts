import { DataSet } from 'choerodon-ui/pro';
import { FieldType, DataSetProps, FieldProps } from '@/interface';

const mapping: {
  [key: string]: FieldProps
} = {
  agreement: {
    name: 'protocol',
    type: 'string' as FieldType,
    label: '协议',
    valueField: 'value',
    textField: 'name',
    options: new DataSet({
      data: [{
        value: 'TCP',
        name: 'TCP',
      }, {
        value: 'UDP',
        name: 'UDP',
      }, {
        value: 'SCTP',
        name: 'SCTP',
      }],
    }),
    dynamicProps: {
      required: ({ record }) => record.get(mapping.name.name) || record.get(mapping.port.name),
    },
  },
  name: {
    name: 'name',
    type: 'string' as FieldType,
    label: '名称',
    dynamicProps: {
      required: ({ record }) => record.get(mapping.agreement.name) || record.get(mapping.port.name),
    },
  },
  port: {
    name: 'containerPort',
    type: 'string' as FieldType,
    label: '容器端口',
    dynamicProps: {
      required: ({ record }) => record.get(mapping.agreement.name) || record.get(mapping.name.name),
    },
  },
};

// @ts-ignore
const portConfigDataSet = (): DataSetProps => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export { mapping };

export default portConfigDataSet;
