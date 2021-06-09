import { useLocalStore } from 'mobx-react-lite';

export default function useStore({ DEPLOYMENT_TAB }: { DEPLOYMENT_TAB: string }) {
  return useLocalStore(() => ({
    tabKey: DEPLOYMENT_TAB,

    setTabKey(data: string) {
      this.tabKey = data;
    },
    get getTabKey() {
      return this.tabKey;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
