import { useFormatMessage } from '@choerodon/master';
import { useAppPipelineEditStore } from '../stores';

const useFormatAppPipelineEdit = () => {
  const {
    intlPrefix,
  } = useAppPipelineEditStore();

  return useFormatMessage(intlPrefix);
};

export default useFormatAppPipelineEdit;
