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
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
