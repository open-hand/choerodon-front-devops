import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/master';
import { handlePromptError } from '@/utils';

export default function useStore() {
  return useLocalStore(() => ({
    selectedRecord: null,
    setSelectedRecord(record) {
      this.selectedRecord = record;
    },
    get getSelectedRecord() {
      return this.selectedRecord;
    },
  }));
}
