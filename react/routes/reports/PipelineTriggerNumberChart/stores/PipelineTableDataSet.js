/* eslint-disable import/no-anonymous-default-export */
export default () => ({
  selection: false,
  fields: [
    {
      name: 'status',
      label: '状态',
    },
    {
      name: 'code',
      label: '执行编号',
    },
    {
      name: 'name',
      label: '流水线名称',
    },
    {
      name: 'stages',
      label: '阶段',
    },
    {
      name: 'appservice',
      label: '关联应用服务',
    },
    {
      name: 'startDate',
      label: '开始时间',
    },
    {
      name: 'durations',
      label: '执行耗时',
    },
    {
      name: 'user',
      label: '触发者',
    },
  ],
});
