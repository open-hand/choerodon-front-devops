import { useLocalStore } from 'mobx-react-lite';
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
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
