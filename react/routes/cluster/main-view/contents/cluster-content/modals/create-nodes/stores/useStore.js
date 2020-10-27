import { useLocalStore } from 'mobx-react-lite';
import { axios } from '@choerodon/boot';
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
    checkNodeConnect(projectId, data) {
      return axios.post(`/devops/v1/projects/${projectId}/nodes/connection_test`, JSON.stringify(data));
    },
  }));
}
