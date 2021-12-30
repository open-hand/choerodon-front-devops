/* eslint-disable max-len */
import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { DEFAULT_TMP_ID } from '@/routes/app-pipeline/stores/CONSTANTS';
import { TAB_CI_CONFIG } from '../stores/CONSTANTS';
import { ciTemplatesVariablesApi } from '@/api/ci-templates-variables';
import { pipelineVariablesApi } from '@/api/pipeline-variables';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id:string
  type?: 'create' | 'modify'
  setTabsDataState:(...args:any[])=>void
}

function useLoadVariasLists(configs:PipelineApiConfigs, options?:LoadStageDataProps) {
  const {
    type = 'create',
    id,
    setTabsDataState,
  } = configs;

  const {
    tabApis = {},
    level,
  } = usePipelineContext();

  const { create: createPromise, modify: modifyPromise } = tabApis?.[TAB_CI_CONFIG] || { create: '', modify: '' };

  const handleSuccess = (basicInfo:any[]) => {
    setTabsDataState({
      [TAB_CI_CONFIG]: basicInfo || [],
    });
  };

  const getVariasLists = () => {
    if (level === 'project') {
      if (type === 'create') {
        if (id === DEFAULT_TMP_ID) {
          return Promise.resolve([]);
        }
        return ciTemplatesVariablesApi.getCiVariasListsWhileCreate(id);
      }
      return pipelineVariablesApi.getCiVariasListsWhileModify(id);
    }
    if (type === 'create') return createPromise(id);
    return modifyPromise(id);
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-ci-varias', id],
    getVariasLists,
    { ...options, onSuccess: handleSuccess, retry: 0 });
}

export default useLoadVariasLists;
