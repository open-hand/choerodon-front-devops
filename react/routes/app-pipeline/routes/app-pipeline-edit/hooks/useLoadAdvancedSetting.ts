import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import { initCustomFunc } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';

function useAdvancedSetting(configs: any, options?: any) {
  const {
    type = 'create',
    id,
    setTabsDataState,
  } = configs;

  const handleSuccess = (data:Record<string, any>) => {
    setTabsDataState({
      [TAB_ADVANCE_SETTINGS]: data || {},
    });
  };

  const getData = async () => {
    if (type === 'create') {
      const res = await initCustomFunc();
      return res;
    }
    return Promise.resolve({});
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-advancedSetting', id],
    getData,
    { ...options, onSuccess: handleSuccess });
}

export default useAdvancedSetting;
