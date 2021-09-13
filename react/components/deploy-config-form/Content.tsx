import React, {
  useState, useMemo, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, TextField, TextArea, Select, Spin,
} from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import { ResizeType } from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import { useDeployConfigFormStore } from './stores';

import './index.less';

const DeployConfigForm = () => {
  const {
    prefixCls,
    formDs,
    modal,
    refresh,
    isModify,
  } = useDeployConfigFormStore();

  const record = useMemo(() => formDs.current, [formDs.current]);
  const [isError, setValueError] = useState(false);

  modal.handleOk(async () => {
    if (isError) return false;

    try {
      if (!formDs.current?.get('value')) {
        message.error('配置信息为必填');
      }
      const res = await formDs.submit();
      if (res && res.list) {
        const { id, value } = res.list[0];
        refresh({ valueId: id, value });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  const handleValueChange = useCallback((value) => {
    record?.set('value', value);
  }, [record]);

  const renderValue = useCallback(() => {
    const app = record?.get('appServiceId');
    return app ? (
      <YamlEditor
        readOnly={false}
        value={record?.get('value')}
        originValue={record?.getPristineValue('value')}
        onValueChange={handleValueChange}
        handleEnableNext={setValueError}
      />
    ) : null;
  }, [record]);

  if (!record) {
    return <Spin />;
  }

  return (
    <>
      <div className={prefixCls}>
        <Form dataSet={formDs}>
          <TextField name="name" autoFocus />
          <TextArea name="description" resize={'vertical' as ResizeType} />
          {isModify
            ? <TextField name="appServiceName" disabled />
            : (
              <Select
                clearButton={false}
                searchable
                name="appServiceId"
              />
            )}
        </Form>
      </div>
      <h3>部署配置</h3>
      {renderValue()}
    </>
  );
};

export default observer(DeployConfigForm);
