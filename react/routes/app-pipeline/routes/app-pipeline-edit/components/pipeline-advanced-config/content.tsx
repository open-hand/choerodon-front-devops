import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { mapping, versionStrategyData } from './stores/pipelineAdvancedConfigDataSet';
import CustomFunc from '@/routes/app-pipeline/routes/pipeline-manage/components/PipelineCreate/components/custom-function';
import { TAB_ADVANCE_SETTINGS } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores/CONSTANTS';
import { usePipelineAdvancedStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-advanced-config/stores';
import { useAppPipelineEditStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/stores';

const Index = observer(() => {
  const {
    tabsData,
    setTabsDataState,
  } = useAppPipelineEditStore();

  const {
    PipelineAdvancedConfigDataSet,
  } = usePipelineAdvancedStore();
  return (
    <>
      <Form dataSet={PipelineAdvancedConfigDataSet} columns={2}>
        <Select combo colSpan={2} name={mapping.CIRunnerImage.name} />
        <SelectBox colSpan={1} name={mapping.versionStrategy.name} />
        {
          PipelineAdvancedConfigDataSet
            ?.current?.get(mapping.versionStrategy.name) === versionStrategyData[0].value ? (
              <TextField colSpan={1} name={mapping.nameRules.name} />
            ) : (
              <TextField colSpan={1} name={mapping.versionName.name} />
            )
        }
      </Form>
      <CustomFunc
        useStore={{
          getFuncList: tabsData?.[TAB_ADVANCE_SETTINGS]?.devopsCiPipelineFunctionDTOList,
          setFuncList: (list: any) => {
            setTabsDataState({
              [TAB_ADVANCE_SETTINGS]: {
                ...tabsData?.[TAB_ADVANCE_SETTINGS],
                devopsCiPipelineFunctionDTOList: list,
              },
            });
          },
        }}
      />
    </>
  );
});

export default Index;
