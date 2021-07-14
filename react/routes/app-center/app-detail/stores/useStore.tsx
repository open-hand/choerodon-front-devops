import { useLocalStore } from 'mobx-react-lite';

export interface EnvDataProps {
  id: string,
  connect: boolean,
}

export interface HostDataProps {
  id: string,
  hostStatus: 'connected' | 'disconnect',
}

export default function useStore({
  defaultTabKey,
  defaultMainTabKey,
}: { defaultTabKey: string, defaultMainTabKey: string }) {
  return useLocalStore(() => ({
    // 具体页面内容tab
    currentTabKey: defaultTabKey,
    setCurrentTabKey(key:string) {
      this.currentTabKey = key;
    },
    get getCurrentTabKey() {
      return this.currentTabKey;
    },

    // 环境或主机tab
    currentMainTabKey: defaultMainTabKey,
    setCurrentMainTabKey(key:string) {
      this.currentMainTabKey = key;
    },
    get getCurrentMainTabKey() {
      return this.currentMainTabKey;
    },

    selectedEnv: {},
    setSelectedEnv(data: EnvDataProps) {
      this.selectedEnv = data;
    },
    get getSelectedEnv() {
      return this.selectedEnv;
    },

    selectedHost: {},
    setSelectedHost(data: HostDataProps) {
      this.selectedHost = data;
    },
    get getSelectedHost() {
      return this.selectedHost;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
