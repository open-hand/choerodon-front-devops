import React, {
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, TextField, TextArea,
} from 'choerodon-ui/pro';
import { useBoolean } from 'ahooks';
import { useCiVariasConfigsStore } from './stores';
import {
  ButtonColor, FuncType, Record, ResizeType,
} from '@/interface';

const CiVariasConfigs = () => {
  const {
    prefixCls,
    formatAppPipeline,
    formatCommon,
    formDs,
  } = useCiVariasConfigsStore();

  const [isReveal, { setFalse, setTrue }] = useBoolean(true);

  useEffect(() => {

  }, []);

  const renderValue = ({ value }:{value:string}) => {
    if (value) {
      return !isReveal ? value : '***********';
    }
    return null;
  };

  const handleAdd = () => {
    formDs.create();
  };

  const handleRemove = (eachRecord:Record) => {
    formDs.remove(eachRecord);
  };

  const handleReveal = () => {
    isReveal ? setFalse() : setTrue();
  };

  const renderForm = () => (
    formDs.map((eachRecord) => (
      <Form record={eachRecord} columns={14} key={eachRecord.id}>
        <TextField colSpan={5} name="key" />
        <span className={`${prefixCls}-equal`}>=</span>
        <TextArea
          colSpan={7}
          name="value"
          renderer={renderValue}
          resize={'vertical' as ResizeType}
          autoSize={{ minRows: 1 }}
        />
        {formDs.length > 1 ? (
          <Button
            funcType={'flat' as FuncType}
            icon="delete"
            onClick={() => handleRemove(eachRecord)}
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
          onClick={handleAdd}
          className={`${prefixCls}-add-btn`}
        >
          添加变量
        </Button>
      </footer>
    </div>
  );
};

export default observer(CiVariasConfigs);
