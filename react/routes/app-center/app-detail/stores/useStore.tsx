import { useLocalStore } from 'mobx-react-lite';

export interface EnvDataProps {
  id: string,
  connect: boolean,
}

export default function useStore({ defaultTabKey }: { defaultTabKey: string }) {
  return useLocalStore(() => ({
    currentTabKey: defaultTabKey,
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },

    selectedEnv: {},
    setSelectedEnv(data: EnvDataProps) {
      this.selectedEnv = data;
    },
    get getSelectedEnv() {
      return this.selectedEnv;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
