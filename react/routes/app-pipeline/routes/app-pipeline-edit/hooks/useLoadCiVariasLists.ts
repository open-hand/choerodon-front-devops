/* eslint-disable max-len */
import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { DEFAULT_TMP_ID } from '@/routes/app-pipeline/stores/CONSTANTS';
import { TAB_CI_CONFIG } from '../stores/CONSTANTS';
import { ciTemplatesVariablesApi } from '@/api/ci-templates-variables';
import { pipelineVariablesApi } from '@/api/pipeline-variables';

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

  const handleSuccess = (basicInfo:any[]) => {
    setTabsDataState({
      [TAB_CI_CONFIG]: basicInfo || [],
    });
  };

  const getVariasLists = () => {
    if (type === 'create') {
      if (id === DEFAULT_TMP_ID) {
        return Promise.resolve([]);
      }
      return ciTemplatesVariablesApi.getCiVariasListsWhileCreate(id);
    }
    return pipelineVariablesApi.getCiVariasListsWhileModify(id);
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-ci-varias', id],
    getVariasLists,
    { ...options, onSuccess: handleSuccess });
}

export default useLoadVariasLists;
