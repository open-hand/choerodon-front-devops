import { useLocalStore } from 'mobx-react-lite';
import { axios, Choerodon } from '@choerodon/master';

export default function useStore() {
  return useLocalStore(() => ({
    oldVersions: [],
    setOldVersions(data) {
      this.oldVersions = data || [];
    },
    get getOldVersions() {
      return this.oldVersions;
    },
  }));
}
