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
      name: 'realName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.environment.Username' }),
    },
    {
      name: 'loginName',
      type: 'string',
      label: formatMessage({ id: 'c7ncd.environment.LoginName' }),
    },
    {
      name: 'roles',
      type: 'object',
      label: formatMessage({ id: 'c7ncd.environment.Projectrole' }),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: formatMessage({ id: 'c7ncd.environment.AddedTime' }),
    },
    {
      name: 'iamUserId', type: 'string', textField: 'realName', valueField: 'iamUserId', label: formatMessage({ id: `${intlPrefix}.project.member` }),
    },
  ],
  queryFields: [
    {
      name: 'realName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.user` }),
    },
    {
      name: 'loginName',
      type: 'string',
      label: formatMessage({ id: `${intlPrefix}.environment.permission.name` }),
    },
  ],
});
