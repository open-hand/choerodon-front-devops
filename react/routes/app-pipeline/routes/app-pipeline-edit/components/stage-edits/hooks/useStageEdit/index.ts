import { useStageEditsStore } from '../../stores';

const useStageEdit = () => {
  const {
    mainStore,
  } = useStageEditsStore();

  return mainStore;
};

export default useStageEdit;
