/* eslint-disable max-len */
import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { useSessionStorageState, useUnmount } from 'ahooks';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';
import { TAB_BASIC } from '../stores/CONSTANTS';

type LoadStageDataProps = Omit<UseQueryOptions<unknown, unknown, Record<string, any>, QueryKey>, 'queryKey' | 'queryFn'>

type PipelineApiConfigs = {
  id?:string | number
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

  useUnmount(() => setLocalData(null));

  const handleSuccess = (basicInfo:Record<string, any>) => {
    setTabsDataState({
      [TAB_BASIC]: basicInfo || {},
    });
  };

  const getBasicInfo = () => {
    if (type === 'create') {
      return Promise.resolve(localData);
    }
    return Promise.resolve({});
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-basic-info', id],
    getBasicInfo,
    { ...options, onSuccess: handleSuccess });
}

export default useLoadBasicInfo;
