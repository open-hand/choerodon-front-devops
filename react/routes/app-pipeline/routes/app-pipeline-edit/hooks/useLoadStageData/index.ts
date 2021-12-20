import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { pipelinTemplateApi } from '@/api/pipeline-template';
import { DEFAULT_TMP_ID } from '@/routes/app-pipeline/stores/CONSTANTS';
import { DEFAULT_STAGES_DATA } from '../../stores/CONSTANTS';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id?:string | number
  type?: 'create' | 'modify'
}

function useLoadStageData(configs:PipelineApiConfigs, options?:LoadStageDataProps) {
  const {
    type = 'create',
    id,
  } = configs;

  // eslint-disable-next-line max-len
  const getTemplatesById = () => (id && id !== DEFAULT_TMP_ID ? pipelinTemplateApi.getTemplateDataById(id) : Promise.resolve(DEFAULT_STAGES_DATA));

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-edit', id],
    getTemplatesById, { ...options });
}

export default useLoadStageData;
