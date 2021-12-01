import { useLocalStore } from 'mobx-react-lite';

export default function useStore() {
  return useLocalStore(() => ({
    stagesData: [],
    setStagesData(value:any) {
      this.stagesData = value;
    },
  }));
}

export type StoreProps = ReturnType<typeof useStore>;
