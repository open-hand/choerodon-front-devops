import { useLocalStore } from 'mobx-react-lite';
import { marketHzeroApi } from '@/api';

export default function useStore({
  defaultTypeTabKey,
}: { defaultTypeTabKey: string }) {
  return useLocalStore(() => ({
    currentTypeTabKey: defaultTypeTabKey,
    setCurrentTypeTabKey(key:string) {
      this.currentTypeTabKey = key;
    },
    get getCurrentTypeTabKey() {
      return this.currentTypeTabKey;
    },

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

    async loadHzeroSyncStatus() {
      try {
        const res = await marketHzeroApi.loadSyncStatus();
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
