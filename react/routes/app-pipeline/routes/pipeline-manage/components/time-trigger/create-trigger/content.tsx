import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  TextField,
  Select,
} from 'choerodon-ui/pro';
import {
  Button,
} from 'choerodon-ui';
import {
  NewTips,
  CustomSelect,
} from '@choerodon/components';
import {
  useCreateTriggerStore,
} from './stores';
import {
  mapping,
  triggerWayData,
} from './stores/createTriggerDataSet';
import {
  mapping as variableMapping,
} from './stores/variableDataSet';

import './index.less';

const cssPrefix = 'c7ncd-createTrigger';

const Index = observer(() => {
  const {
    CreateTriggerDataSet,
    VariableDataSet,
  } = useCreateTriggerStore();

  const renderVariable = () => VariableDataSet.map((record: any) => (
    <Form record={record} columns={24}>
      <TextField colSpan={10} name={variableMapping.name.name} />
      <span
        // @ts-ignore
        colSpan={2}
        style={{
          position: 'relative',
          top: '15px',
        }}
      >
        =
      </span>
      <TextField colSpan={10} name={variableMapping.value.name} />
      {/* @ts-ignore */}
      {
        VariableDataSet.length > 1 && (
        <Button
          funcType="flat"
          icon="delete_black-o"
        // @ts-ignore
          colSpan={2}
          style={{
            position: 'relative',
            top: '9px',
            left: '-12px',
          }}
        />
        )
      }
    </Form>
  ));

  return (
    <>
      <Form dataSet={CreateTriggerDataSet}>
        <TextField name={mapping.planName.name} />
        <Select name={mapping.branch.name} />
      </Form>
      <p className={`${cssPrefix}-config ${cssPrefix}-title`}>
        执行变量配置
        <NewTips helpText="" />
      </p>
      {renderVariable()}
      <p className={`${cssPrefix}-title`}>
        定时触发方式
      </p>
      <div className={`${cssPrefix}-customSelect`}>
        <CustomSelect
          onClickCallback={(value) => {
            CreateTriggerDataSet?.current?.set(mapping.triggerWay.name, value.value);
          }}
          data={triggerWayData}
          identity="value"
          mode="single"
          customChildren={(item) => (
            <div className={`${cssPrefix}-customSelect-item`}>
              <p>{item.name}</p>
            </div>
          )}
        />
      </div>
    </>

  );
});

export default Index;
