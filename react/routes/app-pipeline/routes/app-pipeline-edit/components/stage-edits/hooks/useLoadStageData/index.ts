import { useQuery, UseQueryOptions, QueryKey } from 'react-query';

import tempdata from '../../stores/data.json';

function useLoadStageData(options?:Omit<UseQueryOptions<unknown, unknown, any[], QueryKey>, 'queryKey' | 'queryFn'>) {
  return useQuery<unknown, unknown, Array<any>>('app-pipeline-edit',
    () => new Promise((resolve) => setTimeout(() => {
      const { devopsCdStageVOS, devopsCiStageVOS } = tempdata;
      resolve([...devopsCiStageVOS, ...devopsCdStageVOS]);
    }, 500)), { ...options });
}

export default useLoadStageData;
