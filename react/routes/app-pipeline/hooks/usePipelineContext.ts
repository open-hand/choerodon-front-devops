import { useContext } from 'react';
import { Stores } from '@/routes/app-pipeline';

function usePipelineContext() {
  return useContext(Stores);
}

export default usePipelineContext;
