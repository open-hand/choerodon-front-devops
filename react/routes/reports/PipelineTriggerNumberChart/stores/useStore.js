import { useLocalStore } from 'mobx-react-lite';

export default function useStore(AppState) {
  return useLocalStore(() => ({
    selectedPipeline: null,
    setSelectedPipeline(value) {
      this.selectedPipeline = value;
    },
  }));
}
