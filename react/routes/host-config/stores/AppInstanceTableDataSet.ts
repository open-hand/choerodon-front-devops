/*
 * @Author: isaac
 * @LastEditors: isaac
 * @Description:
 * i made my own lucky
 */
/* eslint-disable import/no-anonymous-default-export */
import { DataSet, DataSetProps } from '@/interface';
import { hostApiConfig } from '@/api/Hosts';

interface ListProps {
  formatMessage(arg0: object, arg1?: object): string,
  intlPrefix: string,
  projectId: any,
}

export default ({ formatMessage, intlPrefix }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  transport: {
    read: hostApiConfig.loadHostsAppList(),
  },
  fields: [
    { name: 'name', label: formatMessage({ id: 'c7ncd.environment.Name' }) },
    { name: 'code', label: formatMessage({ id: 'code' }) },
    { name: 'status', label: formatMessage({ id: 'boot.states' }) },
    { name: 'pid', label: formatMessage({ id: `${intlPrefix}.process` }) },
    { name: 'ports', label: formatMessage({ id: `${intlPrefix}.port.occupied` }) },
    { name: 'deployer', label: formatMessage({ id: `${intlPrefix}.deployer` }) },
    { name: 'creationDate', label: formatMessage({ id: `${intlPrefix}.deploy.date` }) },

  ],
  queryFields: [
    {
      name: 'name',
      label: formatMessage({ id: 'c7ncd.resource.Name' }),
    },
    { name: 'status', label: formatMessage({ id: 'boot.states' }) },
  ],
});
