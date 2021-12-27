import React, { useRef } from 'react';
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
  STEP_TEMPLATE,
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
import MavenBuildAdvancedSetting from './components/mavenBuild-advancedSetting';

import './index.less';

const prefix = 'c7ncd-buildModal-content';

const DockerDom = observer(({
  record,
}: any) => (
  <>
    <Form record={record} columns={2}>
      <TextField name={StepMapping.stepName.name} />
      <TextField
        newLine
        name={StepMapping.dockerFilePath.name}
      />
      <TextField name={StepMapping.imageContext.name} />
      <SelectBox name={StepMapping.TLS.name} />
      <SelectBox name={StepMapping.imageSafeScan.name} />
      {
        record.get(StepMapping.imageSafeScan.name) && (
          <SelectBox name={StepMapping.imagePublishGuard.name} />
        )
      }
    </Form>
    {
      record.get(StepMapping.imageSafeScan.name)
      && record.get(StepMapping.imagePublishGuard.name) && (
        <>
          <p>门禁限制</p>
          <Form columns={3} record={record}>
            <Select name={StepMapping.bugLevel.name} />
            <Select name={StepMapping.symbol.name} />
            <NumberField name={StepMapping.condition.name} />
          </Form>
        </>
      )
    }
  </>
));

const SonarDom = observer(({
  record,
}: any) => (
  <Form record={record} columns={2}>
    <TextField name={StepMapping.stepName.name} />
    <Select name={StepMapping.examType.name} />
    {
      (function () {
        if (record.get(StepMapping.examType.name) === scanTypeData[0].value) {
          return <TextField name={StepMapping.scanPath.name} />;
        }
        if (record.get(StepMapping.examType.name) === scanTypeData[1].value) {
          return <SelectBox name={StepMapping.whetherMavenSingleMeasure.name} />;
        }
        return '';
      }())
    }
    <SelectBox
      name={StepMapping.sonarqubeConfigWay.name}
      newLine
    />
    {
      record.get(StepMapping.sonarqubeConfigWay.name) === sonarConfigData[1].value && (
        <>
          <SelectBox
            name={StepMapping.sonarqubeAccountConfig.name}
          />
          {
            record.get(StepMapping.sonarqubeAccountConfig.name) === accountConfigData[0].value ? (
              <>
                <TextField name={StepMapping.username.name} />
                <TextField name={StepMapping.password.name} />
              </>
            ) : (
              <TextField name={StepMapping.token.name} />
            )
          }
          <TextField name={StepMapping.address.name} />
        </>
      )
    }

  </Form>
));

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

  const renderCloseModal = () => {
    if (level && level === 'project') {
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

  const handleOk = async (canWait?: boolean) => {
    const res = await BuildDataSet.current.validate(true);
    let stepRes = true;
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
    const advancedRes = await advancedRef?.current?.getDataSet()?.current?.validate(true);
    const result = {
      ...transformSubmitData(BuildDataSet),
      devopsCiStepVOList: stepDataSetTransformSubmitData(StepDataSet),
      ...advancedTransformSubmitData(advancedRef?.current?.getDataSet()),
      ciTemplateJobGroupDTO: {
        type,
      },
      type,
      // TODO 待删
      appService,
      completed: res && stepRes && advancedRes,
    };
    if (canWait) {
      const flag = await handleJobAddCallback(result);
      return flag;
    }
    handleJobAddCallback(result);
    return true;
  };

  if (modal) {
    modal.handleOk(() => handleOk(true));
  }

  const renderStepItemForm = (itemRecord: Record) => {
    let result: any = '';
    switch (itemRecord.get(StepMapping.type.name)) {
      case BUILD_MAVEN: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.projectRelyRepo.name} />
            {/* @ts-ignore */}
            <div colSpan={2}>
              <MavenBuildAdvancedSetting
                prefix={prefix}
                record={itemRecord}
              />
            </div>
            <YamlEditor
              newLine
              colSpan={2}
              showError={false}
              readOnly={false}
              modeChange={false}
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
            />
          </Form>
        );
        break;
      }
      case BUILD_NPM: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <YamlEditor
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
              showError={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_DOCKER: {
        result = <DockerDom record={itemRecord} />;
        break;
      }
      case BUILD_UPLOADJAR: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.targetProductsLibrary.name} />
            <YamlEditor
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
              showError={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_GO: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <YamlEditor
              showError={false}
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_MAVEN_PUBLISH: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.targetProductsLibrary.name} />
            <Select colSpan={2} name={StepMapping.projectRelyRepo.name} />
            {/* @ts-ignore */}
            <div colSpan={2}>
              <MavenBuildAdvancedSetting
                prefix={prefix}
                record={itemRecord}
              />
            </div>
            <YamlEditor
              showError={false}
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_SONARQUBE: {
        result = <SonarDom record={itemRecord} />;
        break;
      }
      case BUILD_UPLOAD_CHART_CHOERODON: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
          </Form>
        );
        break;
      }
      default: {
        break;
      }
    }
    return result;
  };

  const handleExpand = (value: boolean) => {
    stepData.forEach((record: Record) => {
      record.set(StepMapping.expand.name, value);
    });
  };

  const renderStepItem = (record: any, index: number) => (
    // TODO 这里要改
    <Draggable draggableId={String(record.id)} index={index}>
      {(dragProvided: any, dragSnapshot: any) => (
        <div
          className={`${prefix}__stepItem`}
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
        >
          <div
            className={`${prefix}__stepItem__side`}
            {...dragProvided.dragHandleProps}
          >
            <Icon type="baseline-drag_indicator" />
          </div>
          <div className={`${prefix}__stepItem__main`}>
            <div className={`${prefix}__stepItem__main__first`}>
              <div className={`${prefix}__stepItem__main__first__left`}>
                <Icon
                  className={`${prefix}__stepItem__main__expand`}
                  type={record.get(StepMapping.expand.name) ? 'arrow_drop_down' : 'arrow_drop_up'}
                  onClick={() => {
                    record.set(StepMapping.expand.name, !record.get(StepMapping.expand.name));
                  }}
                />
                <p className={`${prefix}__stepItem__main__name`}>{ record.get(StepMapping.name.name) }</p>
              </div>
              <Icon
                className={`${prefix}__stepItem__main__first__remove`}
                type="remove_circle_outline"
                onClick={() => {
                  StepDataSet.delete([record], false);
                }}
              />
            </div>
            {record.get(StepMapping.expand.name) && renderStepItemForm(record)}
          </div>
        </div>
      )}
    </Draggable>
  );

  const renderSteps = (ds: any) => (
    <DragDropContext
      onDragEnd={(d: any) => console.log(d)}
    >
      <Droppable droppableId="context">
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            style={{
              // background: snapshot.isDraggingOver ? 'blue' : 'white',
            }}
            {...provided.droppableProps}
          >
            {
              ds?.map((record: Record, index: number) => renderStepItem(record, index))
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

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
        data={[{
          text: '基础配置',
          el: '.c7ncd-buildModal-content__main',
          type: 'scrollTop' as typeProps,
        }, {
          text: '步骤配置',
          el: '.c7ncd-buildModal-content__main__step',
        }, {
          text: '高级设置',
          el: '.c7ncd-buildModal-content__main__advanced',
        }]}
      />
      <div className={`${prefix}__main`}>
        <Form className={`${prefix}__main__public`} dataSet={BuildDataSet} columns={6}>
          {
            renderBuild(BuildDataSet, template)
          }
        </Form>
        <div className={`${prefix}__main__divided`} />
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
            dom: <AddStep ds={StepDataSet} />,
            // text: '添加步骤',
            // onClick: handleAddStep,
            // overlay: addStepMenu,
          }]}
        />
        {renderSteps(stepData)}
        <div
          style={{
            marginTop: stepData.length > 0 ? 0 : 20,
          }}
          className={`${prefix}__main__divided`}
        />
        <AdvancedSetting
          data={data}
          cRef={advancedRef}
          className={`${prefix}__main__advanced`}
        />
      </div>
    </div>
  );
});

export default Index;
