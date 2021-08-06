import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    selectedHost: {},
    setSelectedHost(data: object) {
      this.selectedHost = data;
    },
    get getSelectedHost() {
      return this.selectedHost;
    },

    disConnectCommand: '',
    setDisConnectCommand(data: string) {
      this.disConnectCommand = data;
    },
    get getDisConnectCommand() {
      return this.disConnectCommand;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
