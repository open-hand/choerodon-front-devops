/* eslint-disable max-len */
import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { useSessionStorageState } from 'ahooks';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';
import { TAB_BASIC } from '../stores/CONSTANTS';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id:string | number
  type?: 'create' | 'modify'
  setTabsDataState:(...args:any[])=>void
}

function useLoadBasicInfo(configs:PipelineApiConfigs, options?:LoadStageDataProps) {
  const {
    type = 'create',
    id,
    setTabsDataState,
  } = configs;

  const [localData, setLocalData] = useSessionStorageState<any>(PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY);

  const {
    tabApis = {},
    level,
  } = usePipelineContext();

  const { create: createPromise, modify: modifyPromise } = tabApis?.[TAB_BASIC] || { create: '', modify: '' };

  const handleSuccess = (basicInfoData:Record<string, any>) => {
    setTabsDataState({
      [TAB_BASIC]: basicInfoData || {},
    });
  };

  const getBasicInfo = () => {
    if (level === 'project') {
      if (type === 'create') {
        return Promise.resolve(localData);
      }
      return Promise.resolve(localData);
    }
    if (type === 'create') return createPromise(id);
    return modifyPromise(id);
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-basic-info', id],
    getBasicInfo,
    { ...options, onSuccess: handleSuccess });
}

export default useLoadBasicInfo;
