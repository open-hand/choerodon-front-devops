const mapping: any = {
  appName: {
    name: 'name',
    type: 'string',
    label: '应用名称',
  },
  appCode: {
    name: 'code',
    type: 'string',
    label: '应用编码',
    disabled: true,
  },
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

const transformLoadData = (data: any) => ({
  [mapping.appName.name]: data?.[mapping.appName.name],
  [mapping.appCode.name]: data?.[mapping.appCode.name],
  [mapping.versionMark.name]: data?.dockerComposeValueDTO?.[mapping.versionMark.name],
  [mapping.dockerCompose.name]: data?.dockerComposeValueDTO?.[mapping.dockerCompose.name],
  [mapping.command.name]: data?.[mapping.command.name],
});

const Index = (data: any) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    switch (key) {
      case 'appName': {
        item.dynamicProps = {
          required: () => !!data,
        };
      }
    }
    return item;
  }),
});

export default Index;

export {
  mapping,
  transformSubmitData,
  transformLoadData,
};
