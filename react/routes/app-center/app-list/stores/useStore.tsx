import { useLocalStore } from 'mobx-react-lite';

export default function useStore({
  defaultTabKey,
  defaultTypeTabKey,
}: { defaultTabKey: string, defaultTypeTabKey: string }) {
  return useLocalStore(() => ({
    currentTabKey: defaultTabKey,
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },

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
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
