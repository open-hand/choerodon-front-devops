import React from 'react';
import { observer } from 'mobx-react-lite';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  Form, NumberField, Select, SelectBox, TextField,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { YamlEditor } from '@choerodon/components';
import { Record } from '@/interface';
import {
  accountConfigData,
  mapping as StepMapping,
  scanTypeData, sonarConfigData,
} from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/stores/stepDataSet';
import {
  BUILD_DOCKER,
  BUILD_GO,
  BUILD_MAVEN, BUILD_MAVEN_PUBLISH,
  BUILD_NPM, BUILD_SONARQUBE, BUILD_UPLOAD_CHART_CHOERODON, BUILD_UPLOAD_NPM,
  BUILD_UPLOADJAR, GO_UNIT_TEST, MAVEN_UNIT_TEST, NODE_JS_UNIT_TEST,
  TASK_TEMPLATE,
} from '@/routes/app-pipeline/CONSTANTS';
import MavenBuildAdvancedSetting
  from '@/routes/app-pipeline/routes/app-pipeline-edit/components/pipeline-modals/build-modals/components/mavenBuild-advancedSetting';

const DockerDom = observer(({
  record,
  disabled,
}: any) => (
  <>
    <Form disabled={disabled} record={record} columns={2}>
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
          <Form disabled={disabled} columns={3} record={record}>
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
  disabled,
}: any) => (
  <Form disabled={disabled} record={record} columns={2}>
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

const Index = observer(({
  stepData,
  disabled,
  template,
  prefix,
  dataSet,
}: any) => {
  console.log(stepData);

  const renderStepItemForm = (itemRecord: Record) => {
    let result: any = '';
    switch (itemRecord.get(StepMapping.type.name)) {
      case BUILD_MAVEN: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
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
              readOnly={disabled || template === TASK_TEMPLATE}
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
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <YamlEditor
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={disabled || template === TASK_TEMPLATE}
              modeChange={false}
              showError={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_DOCKER: {
        result = (
          <DockerDom
            disabled={disabled || template === TASK_TEMPLATE}
            record={itemRecord}
          />
        );
        break;
      }
      case BUILD_UPLOADJAR: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <Select name={StepMapping.targetProductsLibrary.name} />
            <YamlEditor
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={disabled || template === TASK_TEMPLATE}
              modeChange={false}
              showError={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_GO: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <YamlEditor
              showError={false}
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={disabled || template === TASK_TEMPLATE}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_MAVEN_PUBLISH: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
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
              readOnly={disabled || template === TASK_TEMPLATE}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case BUILD_SONARQUBE: {
        result = <SonarDom disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} />;
        break;
      }
      case BUILD_UPLOAD_CHART_CHOERODON: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
          </Form>
        );
        break;
      }
      case MAVEN_UNIT_TEST: case GO_UNIT_TEST: case NODE_JS_UNIT_TEST: case BUILD_UPLOAD_NPM: {
        result = (
          <Form disabled={disabled || template === TASK_TEMPLATE} record={itemRecord} columns={2}>
            <TextField name={StepMapping.stepName.name} />
            <YamlEditor
              showError={false}
              value={itemRecord.get(StepMapping.script.name)}
              onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
              newLine
              colSpan={2}
              readOnly={disabled || template === TASK_TEMPLATE}
              modeChange={false}
            />
          </Form>
        );
        break;
      }
      case 'custom': {
        result = (
          <YamlEditor
            showError={false}
            value={itemRecord.get(StepMapping.script.name)}
            onValueChange={(value: string) => itemRecord.set(StepMapping.script.name, value)}
            newLine
            colSpan={2}
            readOnly={disabled || template === TASK_TEMPLATE}
            modeChange={false}
          />
        );
      }
      default: {
        break;
      }
    }
    return result;
  };

  const renderStepItem = (record: any, index: number) => (
    // TODO 这里要改
    <Draggable draggableId={String(record.id)} index={record.get(StepMapping.sequence.name)}>
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
              {
                !disabled && (
                  <Icon
                    className={`${prefix}__stepItem__main__first__remove`}
                    type="remove_circle_outline"
                    onClick={() => {
                      dataSet.delete([record], false);
                    }}
                  />
                )
              }
            </div>
            {record.get(StepMapping.expand.name) && renderStepItemForm(record)}
          </div>
        </div>
      )}
    </Draggable>
  );

  const changeArrayItemPos = (arr: any, pos: any, toPos: any) => {
    // 目标索引溢出修复下
    // eslint-disable-next-line
    toPos = Math.min(Math.max(0, toPos), arr.length - 1);
    // 待换索引溢出或与目标索引相同，则不做处理
    if (pos === toPos || pos < 0 || pos > arr.length - 1) {
      return [].concat(arr);
    }
    // eslint-disable-next-line
    const _arr = []; const
      after = pos > toPos;
    // eslint-disable-next-line
    for (let i = 0, len = arr.length; i < len; i++) {
      // 待换索引直接pass
      if (i === pos) {
        // eslint-disable-next-line
        continue;
      } else if (i === toPos) {
        // 目标索引与待换索引前后位置有关系
        if (after) {
          _arr.push(arr[pos]);
          _arr.push(arr[i]);
        } else {
          _arr.push(arr[i]);
          _arr.push(arr[pos]);
        }
      } else {
        _arr.push(arr[i]);
      }
    }
    return _arr;
  };

  const handleDragEnd = (result: any) => {
    const {
      destination: {
        index: desIndex,
      },
      source: {
        index: sourceIndex,
      },
      draggableId,
    } = result;

    const data = dataSet.toData();
    const newData = changeArrayItemPos(data, sourceIndex, desIndex).map((i, index) => ({
      ...i,
      [StepMapping.sequence.name]: index,
    }));
    dataSet.loadData(newData);
  };

  const renderSteps = (ds: any) => (
    <DragDropContext
      onDragEnd={handleDragEnd}
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

  return renderSteps(stepData);
});

export default Index;
