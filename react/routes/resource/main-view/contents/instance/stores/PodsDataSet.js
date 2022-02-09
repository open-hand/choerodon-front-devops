/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
export default ({ intl, intlPrefix, format }) => ({
  selection: false,
  pageSize: 10,
  transport: {},
  fields: [
    {
      name: 'status',
      type: 'string',
      label: format({ id: 'PodStatus' }),
    },
    {
      name: 'name',
      type: 'string',
      label: format({ id: 'Pod' }),
    },
    {
      name: 'containers',
      type: 'object',
      label: format({ id: 'Container' }),
    },
    {
      name: 'ip',
      type: 'string',
      label: 'IP',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: format({ id: 'CreationTime' }),
    },
    {
      name: 'restartCount',
      type: 'string',
      label: format({ id: 'restartCount' }),
    },
    {
      name: 'nodeName',
      type: 'string',
      label: format({ id: 'nodeName' }),
    },
  ],
});
