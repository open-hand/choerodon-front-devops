import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { NewTips } from '@choerodon/components';
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

  const data = tabsData?.[TAB_ADVANCE_SETTINGS]?.defaultImage;

  const {
    PipelineAdvancedConfigDataSet,
    level,
  } = usePipelineAdvancedStore();

  return (
    <>
      <Form style={{ width: '60%' }} dataSet={PipelineAdvancedConfigDataSet} columns={2}>
        <Select
          combo
          colSpan={2}
          name={mapping.CIRunnerImage.name}
          optionRenderer={({ value }) => {
            if (value === data) {
              return (
                <span>
                  {`${value}(平台预置)`}
                </span>
              );
            }
            return (
              <span>
                {value}
              </span>
            );
          }}
        />
        <SelectBox
          colSpan={1}
          name={mapping.versionStrategy.name}
          label={(
            <span>
              版本策略
              <NewTips helpText="此处版本策略指的是流水线中生成的应用服务版本的名称策略；选择为平台默认后，便会默认使用“时间戳+分支名”的命名规则;若选择为自定义，则支持用户输入一个固定或动态的参数作为版本命名规则" />
            </span>
          )}
        />
        {
          PipelineAdvancedConfigDataSet
            ?.current?.get(mapping.versionStrategy.name) === versionStrategyData[0].value ? (
              <TextField
                colSpan={level === 'project' ? 1 : 2}
                name={mapping.nameRules.name}
                newLine={level !== 'project'}
              />
            ) : (
              <TextField
                colSpan={level === 'project' ? 1 : 2}
                name={mapping.versionName.name}
                newLine={level !== 'project'}
              />
            )
        }
      </Form>
      {
        level === 'project' && (
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
        )
      }
    </>
  );
});

export default Index;
