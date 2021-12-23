import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { pipelinTemplateApi } from '@/api/pipeline-template';
import { DEFAULT_TMP_ID } from '@/routes/app-pipeline/stores/CONSTANTS';
import { DEFAULT_STAGES_DATA, TAB_FLOW_CONFIG } from '../stores/CONSTANTS';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { ciCdPipelineApi } from '@/api/cicd-pipelines';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id:string | number
  type?: 'create' | 'modify'
  setTabsDataState:(...args:any[])=>void
}

function useLoadStageData(configs:PipelineApiConfigs, options?:LoadStageDataProps) {
  const {
    type = 'create',
    id,
    setTabsDataState,
  } = configs;

  const {
    tabApis = {},
  } = usePipelineContext();

  const { create: CreatePromise, modify: ModifyPromise } = tabApis?.[TAB_FLOW_CONFIG] || { create: '', modify: '' };

  const handleSuccess = (stageObject:Record<string, any>) => {
    setTabsDataState({
      [TAB_FLOW_CONFIG]: stageObject?.devopsCiStageVOS || [],
    });
  };

  const getStageData = () => {
    if (type === 'create') {
      if (id === DEFAULT_TMP_ID) {
        return Promise.resolve(DEFAULT_STAGES_DATA);
      }
      return CreatePromise || pipelinTemplateApi.getTemplateDataById(id);
    }
    return ModifyPromise || ciCdPipelineApi.getTemplatesWhileEdits(id);
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-edit', id],
    getStageData, { ...options, onSuccess: handleSuccess, retry: 0 });
}

export default useLoadStageData;
