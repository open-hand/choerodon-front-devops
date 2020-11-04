/* eslint-disable import/no-anonymous-default-export */
export default ({ formatMessage, projectId, intlPrefix }) => ({
  autoCreate: true,
  transport: {
  },
  fields: [
    {
      name: 'isCheckQuota',
      type: 'boolean',
      label: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.enabled` }),
      required: true,
    },
    {
      name: 'CPULimit',
      type: 'number',
      label: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.CPULimit` }),
      pattern: /^([1-9]\d*|0)(\.\d{1,10})?$/,
    },
    {
      name: 'CPURquest',
      type: 'number',
      label: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.CPURquest` }),
      pattern: /^([1-9]\d*|0)(\.\d{1,10})?$/,
    },
    {
      name: 'memoryLimit',
      type: 'number',
      label: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.memoryLimit` }),
      pattern: /^([1-9]\d*|0)(\.\d{1,10})?$/,
    },
    {
      name: 'memoryRequest',
      type: 'number',
      label: formatMessage({ id: `${intlPrefix}.env.manage.resourceQuota.memoryRequest` }),
      pattern: /^([1-9]\d*|0)(\.\d{1,10})?$/,
    },
  ],
});
