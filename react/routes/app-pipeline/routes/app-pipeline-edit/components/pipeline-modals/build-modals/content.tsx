import React, {
  useRef, useMemo, useImperativeHandle, useState,
} from 'react';
import {
  Form,
  TextField,
  Select,
  SelectBox,
  NumberField,
} from 'choerodon-ui/pro';
import { templateStepsApi } from '@choerodon/master';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { YamlEditor } from '@choerodon/components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';
import { Record } from '@/interface';
import {
  BUILD_MAVEN,
  BUILD_NPM,
  BUILD_DOCKER,
  BUILD_UPLOADJAR,
  BUILD_GO,
  BUILD_MAVEN_PUBLISH,
  BUILD_SONARQUBE,
  BUILD_UPLOAD_CHART_CHOERODON,
  TASK_TEMPLATE,
  STEP_TEMPLATE, MAVEN_BUILD, CUSTOM_BUILD, MAVEN_UNIT_TEST, GO_UNIT_TEST, NODE_JS_UNIT_TEST,
} from '@/routes/app-pipeline/CONSTANTS';
import {
  mapping as StepMapping,
  transformSubmitData as stepDataSetTransformSubmitData,
  settingConfigOptionsData,
  sonarConfigData,
  accountConfigData,
  scanTypeData,
} from './stores/stepDataSet';
import { mapping, triggerTypeOptionsData, transformSubmitData } from './stores/buildDataSet';
import { mapping as repoConfigMapping, typeData } from './stores/customRepoConfigDataSet';
import { transformSubmitData as advancedTransformSubmitData } from '../advanced-setting/stores/advancedDataSet';
import CloseModal from '../close-modal';
import { useBuildModalStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores';
import AdvancedSetting from '../advanced-setting';
import StepTitle from '../step-title';
import SideStep, { typeProps } from '../side-step';
import AddStep from './components/add-step';
import StepContent from './components/step-content';
import MavenBuildAdvancedSetting from './components/mavenBuild-advancedSetting';

import './index.less';

const prefix = 'c7ncd-buildModal-content';

const handleOk = async ({
  canWait,
  BuildDataSet,
  level,
  template,
  StepDataSet,
  advancedRef,
  handleJobAddCallback,
  type,
  appService,
  id,
  data,
}: {
  canWait?: boolean,
  BuildDataSet?: any,
  level: any,
  template: any,
  StepDataSet?: any,
  advancedRef: any
  handleJobAddCallback: any,
  type: any,
  appService: any,
  id: any,
  data?: any,
}) => {
  let res = true;
  if (BuildDataSet) {
    res = await BuildDataSet.current.validate(true);
  }
  let stepRes = true;
  let advancedRes = true;
  if (level === 'project' || !template || ((template === TASK_TEMPLATE) && (BuildDataSet.current?.get('type') === MAVEN_BUILD))) {
    if (StepDataSet) {
      for (let i = 0; i < StepDataSet.records.filter((j: any) => j.status !== 'delete').length; i += 1) {
        const item = StepDataSet.records.filter((j: any) => j.status !== 'delete')[i];
        // eslint-disable-next-line no-await-in-loop
        const itemResult = await item.validate(true);
        let configFlag = true;
        if ([BUILD_MAVEN, BUILD_MAVEN_PUBLISH].includes(item?.get(StepMapping.type.name))) {
          // eslint-disable-next-line no-await-in-loop
          configFlag = await item.getField(StepMapping.customRepoConfig.name).options.validate();
        }
        if (!itemResult || !configFlag) {
          stepRes = false;
          break;
        }
      }
    }
    advancedRes = await advancedRef?.current?.getDataSet()?.current?.validate(true);
  }
  const result = {
    // 如果需要覆盖加上data 比如builddataset和stepdataset的update更新事件
    ...data || {},
    ...BuildDataSet ? transformSubmitData(BuildDataSet) : {},
    ...StepDataSet ? {
      devopsCiStepVOList: stepDataSetTransformSubmitData(StepDataSet),
    } : {},
    ...advancedTransformSubmitData(advancedRef?.current?.getDataSet()),
    groupType: type,
    ...template === STEP_TEMPLATE ? {
      type,
    } : {},
    // TODO 待删
    appService,
    completed: template !== STEP_TEMPLATE ? res && stepRes && advancedRes : res,
    id,
  };
  if (canWait) {
    if (template !== STEP_TEMPLATE ? res && stepRes && advancedRes : res) {
      const flag = await handleJobAddCallback(result);
      return flag;
    }
    return false;
  }
  handleJobAddCallback(result);
  return true;
};

const Index = observer(() => {
  const {
    modal,
    BuildDataSet,
    StepDataSet,
    handleJobAddCallback,
    data,
    data: {
      id,
      type,
      // TODO 待删
      appService,
      template,
    },
    level,
    advancedRef,
  } = useBuildModalStore();

  // 这里是全部展开和收起的变量
  const [expand, setExpand] = useState(true);

  const stepData = StepDataSet.data;

  const disabled = useMemo(() => level !== 'project' && !template, []);

  const renderCloseModal = () => {
    if (!template) {
      return (
        <CloseModal
          preCheck={() => handleOk({
            canWait: false,
            BuildDataSet,
            level,
            template,
            StepDataSet,
            advancedRef,
            handleJobAddCallback,
            type,
            id,
            appService,
            data,
          })}
          modal={modal}
        />
      );
    }
    return '';
  };

  const renderBuild = (ds: any, temp: string) => {
    switch (temp) {
      case TASK_TEMPLATE: {
        return (
          <>
            <TextField colSpan={2} name={mapping.name.name} />
            <Select colSpan={2} name={mapping.groupId.name} />
            <SelectBox colSpan={2} name={mapping.type.name} />
          </>
        );
        break;
      }
      case STEP_TEMPLATE: {
        return (
          <>
            <TextField colSpan={3} name={mapping.name.name} />
            <Select colSpan={3} name={mapping.categoryId.name} />
          </>
        );
        break;
      }
      default: {
        return (
          <>
            <TextField name={mapping.name.name} colSpan={3} />
            <Select name={mapping.appService.name} colSpan={3} />
            <Select name={mapping.triggerType.name} colSpan={2} />
            { renderTriggerValue(BuildDataSet) }
          </>
        );
      }
    }
  };

  const renderMain = () => {
    switch (BuildDataSet?.current?.get(mapping.type.name)) {
      case MAVEN_BUILD: {
        return (
          <>
            <StepTitle
              className={`${prefix}__main__step`}
              title="步骤配置"
              buttons={[{
                text: expand ? '全部收起' : '全部展开',
                icon: expand ? 'vertical_align_bottom' : 'vertical_align_top',
                onClick: () => handleExpand(!expand),
              }, {
                custom: true,
                dom: disabled ? '' : (
                  <AddStep
                    okProps={{
                      level,
                      template,
                      advancedRef,
                      handleJobAddCallback,
                      type,
                      appService,
                      id,
                      data,
                    }}
                    level={level}
                    ds={StepDataSet}
                  />
                ),
              // text: '添加步骤',
              // onClick: handleAddStep,
              // overlay: addStepMenu,
              }]}
            />
            <StepContent
              stepData={stepData}
              disabled={disabled}
              template={template}
              prefix={prefix}
              dataSet={StepDataSet}
              okProps={{
                level,
                template,
                advancedRef,
                handleJobAddCallback,
                type,
                appService,
                id,
                data,
              }}
            />
            <div
              style={{
                marginTop: stepData.length > 0 ? 0 : 20,
              }}
              className={`${prefix}__main__divided`}
            />
            <AdvancedSetting
              disabled={disabled}
              data={data}
              cRef={advancedRef}
              className={`${prefix}__main__advanced`}
            />
          </>
        );
        break;
      }
      case CUSTOM_BUILD: {
        return (
          <>
            <StepTitle
              className={`${prefix}__main__step`}
              title="自定义脚本"
            />
            <div
              style={{
                marginTop: 16,
              }}
            >
              <YamlEditor
                showError={false}
                readOnly={disabled}
                modeChange={false}
                value={BuildDataSet?.current?.get(mapping.script.name)}
                onValueChange={(value: string) => BuildDataSet
                  ?.current?.set(mapping.script.name, value)}
              />
            </div>
          </>

        );
        break;
      }
      default: {
        return '';
        break;
      }
    }
  };

  if (modal) {
    modal.handleOk(() => handleOk({
      canWait: true,
      BuildDataSet,
      level,
      template,
      StepDataSet,
      advancedRef,
      handleJobAddCallback,
      type,
      appService,
      id,
    }));
  }

  const handleExpand = (value: boolean) => {
    stepData.forEach((record: Record) => {
      record.set(StepMapping.expand.name, value);
    });
    setExpand(value);
  };

  const renderTriggerValue = (ds: any) => {
    if (ds.current?.get(mapping.triggerType.name) === triggerTypeOptionsData[1].value) {
      return <TextField name={mapping.triggerValue.name} colSpan={4} />;
    }
    return <Select combo name={mapping.triggerValue.name} colSpan={4} />;
  };

  const handleAddStep = async () => {
    const res = await templateStepsApi.getTemplateSteps(1);
    console.log(res);
  };

  return (
    <div className={prefix}>
      {renderCloseModal()}
      <SideStep
        scrollContext=".c7ncd-buildModal-content__main"
        data={[
          {
            text: '基础配置',
            el: '.c7ncd-buildModal-content__main',
            type: 'scrollTop' as typeProps,
            display: true,
          }, {
            text: BuildDataSet?.current?.get(mapping.type.name) === MAVEN_BUILD ? '步骤配置' : '自定义脚本',
            el: '.c7ncd-buildModal-content__main__step',
            display: true,
          }, {
            text: '高级设置',
            el: '.c7ncd-buildModal-content__main__advanced',
            display: BuildDataSet?.current?.get(mapping.type.name) === MAVEN_BUILD,
          },
        ]}
      />
      <div className={`${prefix}__main`}>
        <Form
          disabled={disabled}
          className={`${prefix}__main__public`}
          dataSet={BuildDataSet}
          columns={6}
        >
          {
            renderBuild(BuildDataSet, template)
          }
        </Form>
        <div className={`${prefix}__main__divided`} />
        {
          renderMain()
        }
      </div>
    </div>
  );
});

export default Index;

export {
  handleOk,
};
