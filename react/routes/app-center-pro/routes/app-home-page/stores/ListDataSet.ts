/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import { deployAppCenterApiConfig, hostApiConfig } from '@/api';
import { DataSet } from '@/interface';

interface ListProps {
  searchDs: DataSet,
}

export default ({ searchDs }: ListProps): any => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 8,
  queryDataSet: searchDs,
  transport: {
    read: ({ data }: { data: { typeKey: string, envId:number | string, hostId:number | string } }) => {
      const { typeKey } = data || {};
      return typeKey === 'env' ? deployAppCenterApiConfig.getDeployCenterAppList() : hostApiConfig.loadHostsAppList();
    },
  },
});
