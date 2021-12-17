import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { pipelinTemplateApi } from '@/api/pipeline-template';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id:string | number
  type?: 'create' | 'modify'
}

function useLoadStageData(configs:PipelineApiConfigs, options?:LoadStageDataProps) {
  const {
    type = 'create',
    id,
  } = configs;

  const getTemplatesById = () => pipelinTemplateApi.getTemplateDataById(id);

  return useQuery<unknown, unknown, Record<string, any>>('app-pipeline-edit',
    getTemplatesById, { ...options });
}

export default useLoadStageData;
