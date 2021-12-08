/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
export default ({ formatMessage, intlPrefix }) => ({
  selection: false,
  pageSize: 10,
  transport: {},
  fields: [
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.Name' }),
    },
    {
      name: 'description',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.description' }),
    },
    {
      name: 'appServiceName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.environment.ApplicationService' }),
    },
    {
      name: 'envName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.environment' }),
    },
    {
      name: 'createUserRealName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.creator' }),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: formatMessage({ id: 'c7ncd.environment.UpdateTime' }),
    },
  ],
  queryFields: [
    {
      name: 'name',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.Name' }),
    },
    {
      name: 'appServiceName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.ApplicationService' }),
    },
    {
      name: 'envName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.resource.environment' }),
    },
  ],
});
