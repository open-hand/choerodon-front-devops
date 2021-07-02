import { DataSetProps } from '@/interface';
import apis from '@/routes/host-config/apis';
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
        url: HostConfigApi.getJarList(projectId, hostId),
        method: 'get',
      };
    },
    destroy: ({ data: [data] }) => ({
      url: HostConfigApi.jarDelete(projectId, data.hostId, data.id),
      method: 'delete',
    }),
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'name' }) },
    { name: 'pid', label: formatMessage({ id: `${intlPrefix}.process` }) },
    { name: 'port', label: formatMessage({ id: `${intlPrefix}.port.occupied` }) },
    { name: 'deployer', label: formatMessage({ id: `${intlPrefix}.deployer` }) },
    { name: 'creationDate', label: formatMessage({ id: `${intlPrefix}.deploy.date` }) },
  ],
});
