import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';

const mapping = {
  hostId: {
    name: 'hostId',
    type: 'string',
  },
  status: {
    name: 'status',
    type: 'string',
  },
  hostName: {
    name: 'hostName',
    type: 'string',
    label: '主机名称',
    textField: 'name',
    valueField: 'id',
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

export default (projectId, BaseComDeployStore) => ({
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    if (key === 'hostName') {
      item.lookupAxiosConfig = () => ({
        url: BaseComDeployApis.getHostListApi(projectId),
        method: 'post',
        data: {
          params: [],
          searchParam: {
            type: 'deploy',
          },
        },
        transformResponse: (res) => {
          let newRes = res;
          try {
            newRes = JSON.parse(newRes);
            BaseComDeployStore.setHostList(newRes.content);
            return newRes.content;
          } catch (e) {
            BaseComDeployStore.setHostList(newRes);
            return newRes;
          }
        },
      });
    }
    return item;
  }),
  events: {
    update: async ({
      dataSet, record, name, value,
    }) => {
      switch (name) {
        case mapping.hostName.name: {
          const item = BaseComDeployStore.getHostList.find((i) => i.id === value);
          record.set(mapping.ip.name, item.hostIp);
          record.set(mapping.port.name, item.sshPort);
          record.set(mapping.hostId.name, item.id);
          break;
        }
        default:
          break;
      }
    },
  },
});
