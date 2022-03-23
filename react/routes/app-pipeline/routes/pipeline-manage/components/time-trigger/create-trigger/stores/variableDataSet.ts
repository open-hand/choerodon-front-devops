const mapping: any = {
  name: {
    name: 'name',
    type: 'string',
    label: '变量名',
  },
  value: {
    name: 'value',
    type: 'string',
    label: '值',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    return item;
  }),
});

export default Index;

export {
  mapping,
};
