import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { devopsAlienApi } from '@choerodon/master';
import { useLocation, useHistory, useParams } from 'react-router';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import { initCustomFunc } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';
import {
  mapping,
  transformLoadData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores/pipelineAdvancedConfigDataSet';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

function useAdvancedSetting(configs: any, options?: any) {
  const {
    type = 'create',
    id,
    setTabsDataState,
    level,
  } = configs;

  const {
    tabApis,
  } = usePipelineContext();

  const {
    id: urlId,
  } = useParams<any>();

  const handleSuccess = async (data:Record<string, any>) => {
    const defaultImage = await devopsAlienApi.getDefaultImage();
    setTabsDataState({
      [TAB_ADVANCE_SETTINGS]: {
        ...transformLoadData(undefined, {
          [mapping.CIRunnerImage.name]: defaultImage,
        }),
        defaultImage,
        devopsCiPipelineFunctionDTOList: data?.devopsCiPipelineFunctionDTOList || [],
        ...data,
      },
    });
  };

  const getData = async () => {
    if (level === 'project') {
      if (type === 'create') {
        const res = await initCustomFunc();
        return {
          devopsCiPipelineFunctionDTOList: res,
        };
      }
      const res = await initCustomFunc(id);
      return {
        devopsCiPipelineFunctionDTOList: res,
      };
    }
    if (type !== 'create') {
      const data = await tabApis?.[TAB_ADVANCE_SETTINGS]?.modify(urlId);
      return data;
    }

    return {
      devopsCiPipelineFunctionDTOList: [],
    };
  };

  return useQuery<unknown, unknown, Record<string, any>>(['app-pipeline-advancedSetting', id],
    getData,
    { ...options, onSuccess: handleSuccess });
}

export default useAdvancedSetting;
