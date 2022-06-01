import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    currentTabKey: 'application_event',
    setCurrentTabKey(value:string) {
      this.currentTabKey = value;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
