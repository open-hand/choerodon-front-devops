import { useLocalStore } from 'mobx-react-lite';
import { marketHzeroApi } from '@/api';

export default function useStore() {
  return useLocalStore(() => ({
    selectedApp: {},
    setSelectedApp(data: object) {
      this.selectedselectedAppHost = data;
    },
    get getSelectedAPP() {
      return this.selectedApp;
    },

    hzeroSyncStatus: null,
    get getHzeroSyncStatus() {
      return this.hzeroSyncStatus;
    },
    setHzeroSyncStatus(data:any) {
      this.hzeroSyncStatus = data;
    },

    async loadHzeroSyncStatus(organizationId:string) {
      try {
        const res = await marketHzeroApi.loadSyncStatus(organizationId);
        if (res && !res.failed) {
          this.setHzeroSyncStatus(res);
        } else {
          this.setHzeroSyncStatus(null);
        }
      } catch (e) {
        this.setHzeroSyncStatus(null);
      }
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
