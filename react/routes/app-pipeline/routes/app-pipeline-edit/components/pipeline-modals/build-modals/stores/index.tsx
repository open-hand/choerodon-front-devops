import React, {
  createContext, useContext, useMemo, useEffect,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import buildDataSet, { mapping }
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/buildDataSet';
import stepDataSet, { transformLoadData }
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';

interface buildModalProps {
  modal: any,
  BuildDataSet: any
  StepDataSet: any,
  // 构建数据
  data: any,
  // 设置流水线数据回调
  handleJobAddCallback: any
  advancedData: any,
}

const Store = createContext({} as buildModalProps);

export function useBuildModalStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
    data,
  } = props;

  const {
    appService: {
      appServiceId,
    },
  } = data;

  const BuildDataSet = useMemo(() => new DataSet(buildDataSet(appServiceId)), [appServiceId]);
  const StepDataSet = useMemo(() => new DataSet(stepDataSet()), []);

  useEffect(() => {
    if (data) {
      const buildData: any = {};
      Object.keys(mapping).forEach((item: any) => {
        buildData[mapping[item].name] = data[mapping[item].name];
      });
      BuildDataSet.loadData([{
        ...buildData,
        [mapping.appService.name]: data?.appService?.appServiceName,
      }]);
      StepDataSet.loadData(transformLoadData(data?.devopsCiStepVOList));
    }
  }, []);

  const value = {
    ...props,
    BuildDataSet,
    StepDataSet,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
