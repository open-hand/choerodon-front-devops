import { useLocalStore } from 'mobx-react-lite';
import { APP_EVENT, POD_DETAILS } from './CONST';

export default function useStore() {
  return useLocalStore(() => ({
    currentTabKey: APP_EVENT,
    setCurrentTabKey(value:string) {
      this.currentTabKey = value;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
