import { useLocalStore } from 'mobx-react-lite';

export default function useStore({ defaultTabKey }: { defaultTabKey: string }) {
  return useLocalStore(() => ({
    currentTabKey: defaultTabKey,
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },

    selectedApp: {},
    setSelectedApp(data: object) {
      this.selectedselectedAppHost = data;
    },
    get getSelectedAPP() {
      return this.selectedApp;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
