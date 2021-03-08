import { useLocalStore } from 'mobx-react-lite';
import { Record } from '@/interface';

export default function useStore() {
  return useLocalStore(() => ({
    selectedRecords: [],
    get getSelectedRecords() {
      return this.selectedRecords;
    },
    setSelectedRecords(data: Array<Record | never>) {
      this.selectedRecords = data;
    },
  }));
}

export type TableStoreProps = ReturnType<typeof useStore>;
