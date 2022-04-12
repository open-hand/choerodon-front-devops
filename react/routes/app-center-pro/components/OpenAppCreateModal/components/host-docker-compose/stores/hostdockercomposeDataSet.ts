const mapping: any = {
  versionMark: {
    name: 'remark',
    type: 'string',
    label: '版本备注',
    required: true,
  },
  dockerCompose: {
    name: 'value',
    type: 'string',
    required: true,
  },
  command: {
    name: 'runCommand',
    type: 'string',
    required: true,
  },
};

const transformSubmitData = (ds: any) => {
  const record = ds?.current;

  return ({
    [mapping.command.name]: record?.get(mapping.command.name),
    dockerComposeValueDTO: {
      [mapping.versionMark.name]: record?.get(mapping.versionMark.name),
      [mapping.dockerCompose.name]: record?.get(mapping.dockerCompose.name),
    },
  });
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
  transformSubmitData,
};
