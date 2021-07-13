import BaseComDeployApis from '@/routes/deployment/modals/base-comDeploy/apis';
import paramSettingDataSet from '@/routes/deployment/modals/base-comDeploy/stores/paramSettingDataSet';
import { DataSet } from 'choerodon-ui/pro';
import { mapping as baseMapping } from './baseDeployDataSet';

const mapping = {
  checked: {
    name: 'checked',
    type: 'boolean',
  },
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
    label: '外部SSH认证IP',
    disabled: true,
  },
  port: {
    name: 'port',
    type: 'string',
    label: '外部SSH认证端口',
    disabled: true,
  },
  privateIp: {
    name: 'privateIp',
    type: 'string',
    label: '内部SSH认证IP',
    disabled: true,
  },
  privatePort: {
    name: 'privatePort',
    type: 'number',
    label: '内部SSH认证端口',
    disabled: true,
  },
};

export { mapping };

export default (projectId, BaseComDeployStore, random) => ({
  paging: false,
  autoCreate: true,
  fields: Object.keys(mapping).map((key) => {
    const item = mapping[key];
    if (key === 'hostName') {
      item.lookupAxiosConfig = () => ({
        url: BaseComDeployApis.getHostListApi(projectId, random),
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
          if (item) {
            // record.set(mapping.ip.name, item.hostIp);
            // record.set(mapping.port.name, item.sshPort);
            record.set(mapping.hostId.name, item.id);
            record.set(mapping.privateIp.name, item.privateIp);
            record.set(mapping.privatePort.name, item.privatePort);
          } else {
            // record.set(mapping.ip.name, '');
            // record.set(mapping.port.name, '');
            record.set(mapping.hostId.name, '');
            record.set(mapping.privateIp.name, '');
            record.set(mapping.privatePort.name, '');
          }
          break;
        }
        default:
          break;
      }
    },
  },
});
