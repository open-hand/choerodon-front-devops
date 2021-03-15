const mapping = {
  hostName: {
    name: 'hostName',
    type: 'string',
    label: '主机名称',
  },
  ip: {
    name: 'ip',
    type: 'string',
    label: 'IP',
    disabled: true,
  },
  port: {
    name: 'port',
    type: 'string',
    label: '端口',
    disabled: true,
  },
};

export { mapping };

export default () => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => mapping[key]),
});
