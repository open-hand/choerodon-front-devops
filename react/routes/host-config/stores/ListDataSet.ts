import { DataSet, DataSetProps } from '@/interface';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';
import { StoreProps } from '@/routes/host-config/stores/useStore';
import assign from 'lodash/assign';

interface ListProps {
  projectId: number,
  searchDs: DataSet,
  mainStore: StoreProps,
}

export default ({ projectId, searchDs, mainStore }: ListProps): DataSetProps => ({
  autoCreate: false,
  autoQuery: true,
  selection: false,
  paging: true,
  pageSize: 10,
  queryDataSet: searchDs,
  transport: {
    read: ({ params, data }) => ({
      url: HostConfigApis.getLoadHostsDetailsUrl(projectId),
      method: 'post',
      params: assign(params, data),
      data: null,
    }),
  },
  events: {
    load: ({ dataSet }: { dataSet: DataSet }) => {
      const record = dataSet.get(0);
      if (record) {
        mainStore.setSelectedHost(record.toData());
      }
    },
  },
});
