import React, {
  createContext, useContext, useMemo, useEffect, useRef,
} from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import buildDataSet, { mapping, transformLoadData as buildTransformLoadData }
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
  // 外层高级设置数据
  advancedData: any,
  // 层级
  level: any,
  advancedRef: any,
}

const Store = createContext({} as buildModalProps);

export function useBuildModalStore() {
  return useContext(Store);
}

export const StoreProvider = observer((props: any) => {
  const {
    children,
    data,
    level,
    handleJobAddCallback,
  } = props;

  const advancedRef = useRef<any>();

  const appServiceId = data?.appService?.appServiceId;
  const appServiceName = data?.appService?.appServiceName;

  const BuildDataSet = useMemo(() => new DataSet(
    buildDataSet(
      appServiceId,
      data,
      level,
      handleJobAddCallback,
      advancedRef,
    ),
  ), [appServiceId]);
  const StepDataSet = useMemo(() => new DataSet(stepDataSet(
    level,
    data,
    handleJobAddCallback,
    advancedRef,
  )), []);

  const locationValidate = async (buildDs: any, stepDs: any) => {
    async function validateRecord(record: any) {
      const res = await record.validate(true);
      return res;
    }
    for (let i = 0; i < stepDs.records.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await validateRecord(stepDs.records[i]);
      if (!res) {
        document.querySelectorAll('.c7ncd-buildModal-content__stepItem')?.[i]?.scrollIntoView();
        break;
      }
    }
  };

  useEffect(() => {
    if (data) {
      const buildData: any = {};

      BuildDataSet.loadData([buildTransformLoadData(data, appServiceName)]);
      StepDataSet.loadData(transformLoadData(data?.devopsCiStepVOList));
      locationValidate(BuildDataSet, StepDataSet);
    }
  }, []);

  const value = {
    ...props,
    BuildDataSet,
    StepDataSet,
    advancedRef,
  };
  return (
    <Store.Provider value={value}>
      {children}
    </Store.Provider>
  );
});
