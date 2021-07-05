import { DataSetProps } from '@/interface';
import HostConfigApi from '@/routes/host-config/apis/DeployApis';

interface ListProps {
  projectId: number,
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
}

export default ({ projectId, formatMessage, intlPrefix }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: ({ data }) => {
      const { hostId } = data;
      return {
        url: HostConfigApi.getDockerList(projectId, hostId),
        method: 'get',
      };
    },
    destroy: ({ data: [data] }) => ({
      url: HostConfigApi.dockerDelete(projectId, data.hostId, data.id),
      method: 'delete',
    }),
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'name' }) },
    { name: 'status', label: formatMessage({ id: 'status' }) },
    { name: 'hostPort', label: formatMessage({ id: 'port' }) },
    { name: 'deployer', label: formatMessage({ id: `${intlPrefix}.deployer` }) },
    { name: 'creationDate', label: formatMessage({ id: `${intlPrefix}.deploy.date` }) },
  ],
});