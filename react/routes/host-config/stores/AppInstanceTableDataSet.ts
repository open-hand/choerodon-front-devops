import { DataSet, DataSetProps } from '@/interface';
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
  transport: {
    read: {
      url: HostConfigApi.getAppInstanceList(projectId),
      method: 'get',
    },
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'name' }) },
    { name: 'status', label: formatMessage({ id: 'status' }) },
    { name: 'pid', label: formatMessage({ id: `${intlPrefix}.process` }) },
    { name: 'ports', label: formatMessage({ id: `${intlPrefix}.port.occupied` }) },
    { name: 'deployer', label: formatMessage({ id: `${intlPrefix}.deployer` }) },
    { name: 'creationDate', label: formatMessage({ id: `${intlPrefix}.deploy.date` }) },
    { name: 'instanceType', label: '类型' },
  ],
  queryFields: [
    {
      name: 'name',
      label: formatMessage({ id: 'name' }),
    },
    { name: 'status', label: formatMessage({ id: 'status' }) },
    {
      name: 'type',
      label: '类型',
      textField: 'text',
      valueField: 'value',
      options: new DataSet({
        data: [
          {
            text: 'docker',
            value: 'docker_process',
          },
          {
            text: '实例进程',
            value: 'normal_process',
          },
        ],
      }),
    },
  ],
});
