import React, { useRef } from 'react';
import {
  Form, TextField, Select, SelectBox,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { YamlEditor } from '@choerodon/components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
} from '@/routes/app-pipeline/CONSTANTS';
import { mapping as StepMapping } from './stores/stepDataSet';
import { mapping, triggerTypeOptionsData } from './stores/buildDataSet';
import CloseModal from '../close-modal';
import { useBuildModalStore } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores';
import AdvancedSetting from '../advanced-setting';
import StepTitle from '../step-title';
import SideStep, { typeProps } from '../side-step';

import './index.less';

const prefix = 'c7ncd-buildModal-content';

const Index = observer(() => {
  const {
    modal,
    BuildDataSet,
    StepDataSet,
  } = useBuildModalStore();

  const stepData = StepDataSet.data;

  const renderStepItemForm = (itemRecord: Record) => {
    let result: any = '';
    switch (itemRecord.get(StepMapping.type.name)) {
      case BUILD_MAVEN: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.projectRelyRepo.name} />
            <YamlEditor
              colSpan={2}
              readOnly={false}
              modeChange={false}
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
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_DOCKER: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <TextField
              newLine
              name={StepMapping.dockerFilePath.name}
            />
            <TextField name={StepMapping.imageContext.name} />
            <SelectBox name={StepMapping.TLS.name} />
            <SelectBox name={StepMapping.imageSafeScan.name} />
          </Form>
        );
        break;
      }
      case BUILD_UPLOADJAR: {
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.targetProductsLibrary.name} />
            <YamlEditor
              newLine
              colSpan={2}
              readOnly={false}
              modeChange={false}
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
            <YamlEditor
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
        result = (
          <Form record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.examType.name} />
            <SelectBox name={StepMapping.whetherMavenSingleMeasure.name} />
            <SelectBox
              name={StepMapping.sonarqubeConfigWay.name}
              newLine
            />
            <SelectBox
              name={StepMapping.sonarqubeAccountConfig.name}
            />
            <TextField name={StepMapping.username.name} />
            <TextField name={StepMapping.password.name} />
            <TextField name={StepMapping.address.name} />
          </Form>
        );
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
              <Icon className={`${prefix}__stepItem__main__first__remove`} type="remove_circle_outline" />
            </div>
            {record.get(StepMapping.expand.name) && renderStepItemForm(record)}
          </div>
        </div>
      )}
    </Draggable>
  );

  const renderSteps = (ds: any) => (
    <DragDropContext
      onDragEnd={(data: any) => console.log(data)}
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
    return <Select name={mapping.triggerValue.name} colSpan={4} />;
  };

  return (
    <div className={prefix}>
      <CloseModal modal={modal} />
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
          <TextField name={mapping.name.name} colSpan={3} />
          <Select name={mapping.appService.name} colSpan={3} />
          <Select name={mapping.triggerType.name} colSpan={2} />
          { renderTriggerValue(BuildDataSet) }
          {/* <Select name={mapping.triggerValue.name} colSpan={4} /> */}
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
            text: '添加步骤',
            icon: 'add',
          }]}
        />
        {renderSteps(stepData)}
        <div className={`${prefix}__main__divided`} />
        <AdvancedSetting
          className={`${prefix}__main__advanced`}
        />
      </div>
    </div>
  );
});

export default Index;
