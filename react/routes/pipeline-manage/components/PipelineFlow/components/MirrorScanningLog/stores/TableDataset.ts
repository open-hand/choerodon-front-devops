/* eslint-disable import/no-anonymous-default-export */
export default (():any => ({
  autoQuery: true,
  selection: false,
  data: [
    {
      code: 'w-weng',
      status: 'error',
      component: 'libfreetype6',
      versionFix: '1.1.1',
      version: '1.1.0',
      describe: 'Heap buffer overflow in Freetype in Google Chrome prior to 86.0.4240.111 allowed a remote attacker to potentially exploit heap corruption via a crafted HTML page.',
    },
    {
      code: 'w-weng',
      status: 'error',
      component: 'libfreetype6',
      versionFix: '1.1.1',
      version: '1.1.0',
      describe: 'hellowrodsadsadsadwqdwqddsadsdsadqwdqwdsacsadsadsadqs',
    },
  ],
  fields: [
    {
      label: '缺陷码',
      name: 'code',
      type: 'string',
    },
    {
      label: '严重度',
      name: 'status',
      type: 'string',
    },
    {
      label: '组件',
      name: 'component',
      type: 'string',
    },
    {
      label: '当前版本',
      name: 'version',
      type: 'string',
    },
    {
      label: '修复版本',
      name: 'versionFix',
      type: 'string',
    },
    {
      name: 'decribe',
      type: 'string',
    },
  ],
}));
