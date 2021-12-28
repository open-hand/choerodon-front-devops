import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { devopsAlienApi } from '@choerodon/master';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import { initCustomFunc } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';
import {
  mapping,
  transformLoadData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores/pipelineAdvancedConfigDataSet';

function useAdvancedSetting(configs: any, options?: any) {
  const {
    type = 'create',
    id,
    setTabsDataState,
    level,
  } = configs;

  const handleSuccess = async (data:Record<string, any>) => {
    const defaultImage = await devopsAlienApi.getDefaultImage();
    setTabsDataState({
      [TAB_ADVANCE_SETTINGS]: {
        ...transformLoadData(undefined, {
          [mapping.CIRunnerImage.name]: defaultImage,
        }),
        devopsCiPipelineFunctionDTOList: data || [],
      },
    });
  };

  const getData = async () => {
    if (level === 'project') {
      if (type === 'create') {
        const res = await initCustomFunc();
        return res;
      }
      const res = await initCustomFunc(id);
      return res;
    }
    return [];
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-advancedSetting', id],
    getData,
    { ...options, onSuccess: handleSuccess });
}

export default useAdvancedSetting;
