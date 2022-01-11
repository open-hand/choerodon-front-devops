import React, {
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, TextField, TextArea,
} from 'choerodon-ui/pro';
import { useBoolean, useMount, useUnmount } from 'ahooks';
import { isEmpty } from 'lodash';
import { useCiVariasConfigsStore } from './stores';
import {
  ButtonColor, FuncType, ResizeType,
} from '@/interface';
import useTabData from '../../hooks/useTabData';

const CiVariasConfigs = () => {
  const {
    prefixCls,
    formatAppPipeline,
    formatCommon,
    formDs,
  } = useCiVariasConfigsStore();

  const [isReveal, { setFalse, setTrue }] = useBoolean(true);

  const [savedData, setSavedData] = useTabData<any[]>();

  const renderValue = ({ value }:{value:string}) => {
    if (value) {
      return !isReveal ? value : '***********';
    }
    return null;
  };

  const handleReveal = () => {
    isReveal ? setFalse() : setTrue();
  };

  useMount(() => {
    if (!isEmpty(savedData)) {
      formDs.loadData(savedData);
    }
  });

  useUnmount(() => {
    setSavedData(formDs.toData());
  });

  const renderForm = () => (
    formDs.map((eachRecord) => (
      <Form record={eachRecord} columns={14} key={eachRecord.id}>
        <TextField colSpan={5} name="variableKey" />
        <span className={`${prefixCls}-equal`}>=</span>
        <TextArea
          colSpan={7}
          name="variableValue"
          renderer={renderValue}
          resize={'vertical' as ResizeType}
          autoSize={{ minRows: 1 }}
          className={`${prefixCls}-textfiels`}
        />
        {formDs.length > 1 ? (
          <Button
            funcType={'flat' as FuncType}
            icon="delete"
            onClick={() => formDs.remove(eachRecord)}
            style={{
              marginTop: '10px',
            }}
          />
        ) : <span />}
      </Form>
    ))
  );

  return (
    <div className={prefixCls}>
      <header>
        <span>流水线CI变量配置</span>
        <Button funcType={'flat' as FuncType} onClick={handleReveal}>{isReveal ? '显示所有值' : '隐藏所有值'}</Button>
      </header>
      <main>
        {renderForm()}
      </main>
      <footer>
        <Button
          funcType={'flat' as FuncType}
          color={'primary' as ButtonColor}
          icon="add"
          onClick={() => formDs.create()}
          className={`${prefixCls}-add-btn`}
        >
          添加变量
        </Button>
      </footer>
    </div>
  );
};

export default observer(CiVariasConfigs);
