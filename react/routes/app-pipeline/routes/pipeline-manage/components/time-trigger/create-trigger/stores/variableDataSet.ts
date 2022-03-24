const mapping: any = {
  name: {
    name: 'name',
    type: 'string',
    label: '变量名',
    dynamicProps: {
      required: ({ record }: any) => {
        if (record?.get(mapping.value.name)) {
          return true;
        }
        return false;
      },
    },
  },
  value: {
    name: 'value',
    type: 'string',
    label: '值',
    dynamicProps: {
      required: ({ record }: any) => {
        if (record?.get(mapping.name.name)) {
          return true;
        }
        return false;
      },
    },
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
