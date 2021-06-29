import { DataSetProps } from '@/interface';
import apis from '@/routes/host-config/apis';

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
        url: '',
        method: 'get',
      };
    },
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'name' }) },
    { name: 'process', label: formatMessage({ id: `${intlPrefix}.process` }) },
    { name: 'port', label: formatMessage({ id: `${intlPrefix}.port.occupied` }) },
    { name: 'deployer', label: formatMessage({ id: `${intlPrefix}.deployer` }) },
    { name: 'deployDate', label: formatMessage({ id: `${intlPrefix}.deploy.date` }) },
  ],
});
