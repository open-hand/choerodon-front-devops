const mapping = {
  key: {
    name: 'key',
    type: 'string',
    label: '变量名',
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
  autoCreate: true,
  fields: Object.keys(mapping).map((i) => mapping[i]),
});

export default Index;

export { mapping };
