import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    currentTabKey: 'distribute_test',
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },

    selectedHost: {},
    setSelectedHost(data: object) {
      this.selectedHost = data;
    },
    get getSelectedHost() {
      return this.selectedHost;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
