import { useLocalStore } from 'mobx-react-lite';
import { marketHzeroApi } from '@/api';
import { ServiceItemProps } from './FormDataSet';

export default function useStore() {
  return useLocalStore(() => ({
    applicationId: null,
    get getApplicationId() {
      return this.applicationId;
    },
    setApplicationId(data: string) {
      this.applicationId = data;
    },

    serviceData: [],
    get getServiceData() {
      return this.serviceData;
    },
    setServiceData(data: ServiceItemProps[]) {
      this.serviceData = data;
    },

    // hzeroSyncStatus: null,
    // get getHzeroSyncStatus() {
    //   return this.hzeroSyncStatus;
    // },
    // setHzeroSyncStatus(data:any) {
    //   this.hzeroSyncStatus = data;
    // },

    // async loadHzeroSyncStatus() {
    //   try {
    //     const res = await marketHzeroApi.loadSyncStatus();
    //     if (res && !res.failed) {
    //       this.setHzeroSyncStatus(res);
    //     } else {
    //       this.setHzeroSyncStatus(null);
    //     }
    //   } catch (e) {
    //     this.setHzeroSyncStatus(null);
    //   }
    // },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
