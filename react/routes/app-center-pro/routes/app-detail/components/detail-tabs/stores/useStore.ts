import { useLocalStore } from 'mobx-react-lite';
import { APP_EVENT } from './CONST';

export default function useStore({ defaultKey }:{
  defaultKey: {
    name: string,
    key: string
  }
}) {
  return useLocalStore(() => ({
    currentTabKey: defaultKey?.key || APP_EVENT,
    setCurrentTabKey(value:string) {
      this.currentTabKey = value;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
