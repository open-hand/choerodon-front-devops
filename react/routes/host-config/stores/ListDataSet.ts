import { DataSet, DataSetProps } from '@/interface';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';
import { StoreProps } from '@/routes/host-config/stores/useStore';
import { assign, isEqual } from 'lodash';

interface ListProps {
  projectId: number,
  searchDs: DataSet,
  mainStore: StoreProps,
  loadData(data: { hostId: string, hostStatus: string }): void,
}

export default ({
  projectId, searchDs, mainStore, loadData,
}: ListProps): DataSetProps => ({
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
      const { id: selectedId } = mainStore.getSelectedHost || {};
      const selectedRecord = selectedId ? dataSet.find((eachRecord) => eachRecord.get('id') === selectedId) : null;
      if (selectedRecord && !isEqual(selectedRecord.toData(), mainStore.getSelectedHost)) {
        mainStore.setSelectedHost(selectedRecord.toData());
      }
      if (!selectedRecord && record) {
        mainStore.setSelectedHost(record.toData());
        loadData({ hostId: record.get('id'), hostStatus: record.get('hostStatus') });
      }
    },
  },
});
