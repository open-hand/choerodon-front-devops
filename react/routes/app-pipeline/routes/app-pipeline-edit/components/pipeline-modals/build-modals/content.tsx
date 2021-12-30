import React, { useRef, useMemo } from 'react';
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

const Index = observer(() => {
  const {
    modal,
    BuildDataSet,
    StepDataSet,
    handleJobAddCallback,
    data,
    data: {
      type,
      // TODO 待删
      appService,
      template,
    },
    level,
  } = useBuildModalStore();

  const advancedRef = useRef<any>();

  const stepData = StepDataSet.data;

  const disabled = useMemo(() => level !== 'project' && !template, []);

  const renderCloseModal = () => {
    if (!template) {
      return (
        <CloseModal preCheck={handleOk} modal={modal} />
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
                text: '全部收起',
                icon: 'vertical_align_bottom',
                onClick: () => handleExpand(false),
              }, {
                text: '展开',
                icon: 'vertical_align_top',
                onClick: () => handleExpand(true),
              }, {
                custom: true,
                dom: disabled ? '' : <AddStep level={level} ds={StepDataSet} />,
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

  const handleOk = async (canWait?: boolean) => {
    const res = await BuildDataSet.current.validate(true);
    let stepRes = true;
    let advancedRes = true;
    if (template !== STEP_TEMPLATE) {
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
      advancedRes = await advancedRef?.current?.getDataSet()?.current?.validate(true);
    }
    const result = {
      ...transformSubmitData(BuildDataSet),
      devopsCiStepVOList: stepDataSetTransformSubmitData(StepDataSet),
      ...advancedTransformSubmitData(advancedRef?.current?.getDataSet()),
      groupType: type,
      type,
      // TODO 待删
      appService,
      completed: template !== STEP_TEMPLATE ? res && stepRes && advancedRes : res,
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

  if (modal) {
    modal.handleOk(() => handleOk(true));
  }

  const handleExpand = (value: boolean) => {
    stepData.forEach((record: Record) => {
      record.set(StepMapping.expand.name, value);
    });
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
