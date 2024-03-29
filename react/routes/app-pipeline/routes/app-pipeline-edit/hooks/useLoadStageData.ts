import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { pipelinTemplateApi } from '@/api/pipeline-template';
import { DEFAULT_TMP_ID } from '@/routes/app-pipeline/stores/CONSTANTS';
import { DEFAULT_STAGES_DATA, DEFAUTL_CD_STAGE, TAB_FLOW_CONFIG } from '../stores/CONSTANTS';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { ciCdPipelineApi } from '@/api/cicd-pipelines';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id:string | number
  type?: 'create' | 'modify' | 'copy'
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
    level,
  } = usePipelineContext();

  const { create: createPromise, modify: modifyPromise } = tabApis?.[TAB_FLOW_CONFIG] || { create: '', modify: '' };

  const handleSuccess = (stageObject:Record<string, any>) => {
    let stageLists = [];
    if (level === 'project') {
      if (type === 'create') {
        stageLists = stageObject?.devopsCiStageVOS.concat(DEFAUTL_CD_STAGE);
      } else {
        stageLists = stageObject?.devopsCiStageVOS.concat(type === 'copy' ? [] : stageObject.devopsCdStageVOS) || [];
      }
    } else {
      stageLists = stageObject?.templateStageVOS || [];
    }
    setTabsDataState({
      [TAB_FLOW_CONFIG]: stageLists,
    });
  };

  const getStageData = () => {
    if (level === 'project') {
      if (type === 'create') {
        if (id === DEFAULT_TMP_ID) {
          return Promise.resolve(DEFAULT_STAGES_DATA);
        }
        return pipelinTemplateApi.getTemplateDataById(id);
      }
      return ciCdPipelineApi.getTemplatesWhileEdits(id);
    }
    if (type === 'create') return createPromise(id);
    return modifyPromise(id);
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-edit', id],
    getStageData, { ...options, onSuccess: handleSuccess, retry: 0 });
}

export default useLoadStageData;
