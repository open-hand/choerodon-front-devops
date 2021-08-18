import { useLocalStore } from 'mobx-react-lite';

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
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
