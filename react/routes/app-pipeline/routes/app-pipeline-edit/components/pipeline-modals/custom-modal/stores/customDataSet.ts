const mapping: any = {
  value: {
    name: 'script',
    type: 'string',
  },
};

const transformSubmitData = (data: any, ds: any) => ({
  name: data?.name,
  type: data?.type,
  [mapping.value.name]: ds?.current?.get(mapping.value.name),
  ciTemplateJobGroupDTO: {
    type: 'custom',
  },
});

const Index = () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});

export default Index;

export { mapping, transformSubmitData };
