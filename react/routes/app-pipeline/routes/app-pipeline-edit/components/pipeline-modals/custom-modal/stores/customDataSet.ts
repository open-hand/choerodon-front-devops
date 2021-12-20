const mapping: any = {
  value: {
    name: 'value',
    type: 'string',
  },
};

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping };
