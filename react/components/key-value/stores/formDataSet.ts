/* eslint-disable import/no-anonymous-default-export */
export default ({
  title, id, formatMessage, projectId, envId, store,
}:any):any => {
  const checkName = async (value:string, name:string, record:any) => {
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && !pattern.test(value)) {
      return formatMessage({ id: 'network.name.check.failed' });
    }
    if (value && pattern.test(value)) {
      try {
        const res = await store.checkName(projectId, envId, value);
        if (res && !res.failed) {
          return true;
        }
        return formatMessage({ id: 'checkNameExist' });
      } catch (e) {
        return formatMessage({ id: 'checkNameFailed' });
      }
    } else {
      return true;
    }
  };

  return ({
    autoCreate: typeof id !== 'number',
    transport: {
      read: () => ({
        url: title === 'mapping' ? `/devops/v1/projects/${projectId}/config_maps/${id}` : `/devops/v1/projects/${projectId}/secret/${id}?to_decode=true`,
        method: 'GET',
      }),
    },
    fields: [{
      name: 'name',
      type: 'string',
      label: formatMessage({ id: 'app.name' }),
      required: true,
      validator: checkName,
      maxLength: 100,
    }, {
      name: 'description',
      type: 'string',
      label: formatMessage({ id: 'configMap.des' }),
      maxLength: 30,
    }],
  });
};
