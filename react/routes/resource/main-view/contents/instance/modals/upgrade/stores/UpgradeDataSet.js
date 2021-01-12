import pick from 'lodash/pick';

export default ({
  formatMessage, intlPrefix, projectId, versionsDs, valueDs, isMarket,
}) => {
  async function handleUpdate({ name, value, record }) {
    if (name === 'appServiceVersionId') {
      if (value) {
        const item = versionsDs.find((r) => r.get('id') === value);
        item && record.set('appServiceVersionName', item.get('version'));
        valueDs.setQueryParameter('versionId', value);
        await valueDs.query();
        record.set('values', valueDs.current.get('yaml'));
      } else {
        record.set('appServiceVersionName', null);
      }
    }
  }

  return ({
    autoCreate: true,
    autoQuery: false,
    selection: false,
    transport: {
      create: ({ data: [data] }) => {
        const res = pick(data, ['values', 'type', 'instanceId', 'environmentId']);
        if (!res.values) {
          const yaml = valueDs && valueDs.current ? valueDs.current.get('yaml') : '';
          res.values = yaml;
        }
        if (isMarket) {
          res.marketAppServiceId = data.appServiceId;
          res.marketDeployObjectId = data.appServiceVersionId;
        } else {
          res.appServiceId = data.appServiceId;
          res.appServiceVersionId = data.appServiceVersionId;
        }
        return ({
          url: `/devops/v1/projects/${projectId}/app_service_instances${isMarket ? `/market/instances/${data.instanceId}` : ''}`,
          method: 'put',
          data: res,
        });
      },
    },
    fields: [
      {
        name: 'appServiceVersionId', type: 'string', textField: 'version', valueField: 'id', label: formatMessage({ id: `${intlPrefix}.choose.version` }), options: versionsDs,
      },
      { name: 'appServiceVersionName', type: 'string' },
      { name: 'appServiceId', type: 'string' },
      { name: 'environmentId', type: 'string' },
      { name: 'instanceId', type: 'string' },
      { name: 'type', type: 'string', defaultValue: 'update' },
      { name: 'values', type: 'string' },
    ],
    events: {
      update: handleUpdate,
    },
  });
};
