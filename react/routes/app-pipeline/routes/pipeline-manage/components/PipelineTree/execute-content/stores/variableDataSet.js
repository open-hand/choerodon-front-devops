/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
const mapping = {
  key: {
    name: 'key',
    type: 'string',
    label: '变量名',
    validator: (value, name, record) => {
      const keyList = record.dataSet.records.map((i) => i.get('key'));
      if (keyList.filter((i) => i === value).length >= 2) {
        return '变量名不能重复';
      }
      const patter = /^[0-9a-zA-Z_]{1,}$/;
      if (patter.test(value)) {
        return true;
      }
      return '变量名必须为字母、数字或下划线';
    },
    dynamicProps: {
      required: ({ record }) => record.get('value'),
    },
  },
  value: {
    name: 'value',
    type: 'string',
    label: '值',
    dynamicProps: {
      required: ({ record }) => record.get('key'),
    },
  },
};

const Index = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default Index;

export { mapping };
