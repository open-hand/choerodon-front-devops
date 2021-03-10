import { useLocalStore } from 'mobx-react-lite';

export default function useStore(AppState) {
  return useLocalStore(() => ({
    selectedPipelineId: null,
    setSelectedPipeline(value) {
      this.selectedPipelineId = value;
    },
  }));
}
