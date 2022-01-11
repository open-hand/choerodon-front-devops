import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { devopsAlienApi } from '@choerodon/master';
import { useSessionStorageState } from 'ahooks';
import { useLocation, useHistory, useParams } from 'react-router';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import { initCustomFunc } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';
import {
  mapping,
  transformLoadData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores/pipelineAdvancedConfigDataSet';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';
import { PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY } from '@/routes/app-pipeline/stores/CONSTANTS';

function useAdvancedSetting(configs: any, options?: any) {
  const {
    type = 'create',
    id,
    setTabsDataState,
    level,
    tabsData,
  } = configs;

  const {
    tabApis,
  } = usePipelineContext();

  const [localData, setLocalData] = useSessionStorageState<any>(
    PIPELINE_CREATE_LOCALSTORAGE_IDENTIFY,
  );

  const {
    id: urlId,
  } = useParams<any>();

  const handleSuccess = async (data:Record<string, any>) => {
    setTabsDataState({
      [TAB_ADVANCE_SETTINGS]: {
        ...transformLoadData(undefined, data),
        ...data,
        devopsCiPipelineFunctionDTOList: data?.devopsCiPipelineFunctionDTOList
          .map((i: any, index: number) => ({
            ...i,
            focus: index === 0,
          })) || [],
      },
    });
  };

  const getData = async () => {
    const defaultImage = await devopsAlienApi.getDefaultImage();
    if (level === 'project') {
      if (type === 'create') {
        const res = await initCustomFunc();
        return {
          [mapping.CIRunnerImage.name]: defaultImage,
          devopsCiPipelineFunctionDTOList: res,
          defaultImage,
        };
      }
      const res = await initCustomFunc(id);
      return {
        [mapping.CIRunnerImage.name]: localData?.[mapping.CIRunnerImage.name] || defaultImage,
        [mapping.versionName.name]: localData?.[mapping.versionName.name],
        devopsCiPipelineFunctionDTOList: res,
        defaultImage,
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
