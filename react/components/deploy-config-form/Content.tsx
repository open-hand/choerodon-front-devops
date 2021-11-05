import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form, TextField, TextArea, Select, Spin,
} from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import { Loading } from '@choerodon/components';
import { ResizeType } from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import useForceUpdate from '@/hooks/useForceUpdate';
import { useDeployConfigFormStore } from './stores';

import './index.less';

const DeployConfigForm = () => {
  const {
    prefixCls,
    formDs,
    modal,
    refresh,
    isModify,
    valueLoading,
    deployConfigId,
  } = useDeployConfigFormStore();

  const record = useMemo(() => formDs.current, [formDs.current]);

  const forceUpdate = useForceUpdate();

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

  const handleValueChange = (value:any) => {
    record?.set('value', value);
  };

  const handleEnableNext = (flag: boolean) => {
    setValueError(flag);
  };

  const renderValue = () => {
    const app = record?.get('appServiceId');
    if (app && !deployConfigId && valueLoading) {
      return <Loading />;
    }
    return app ? (
      <YamlEditor
        readOnly={false}
        value={record?.get('value')}
        originValue={record?.get('oldValue') || record?.get('value')}
        onValueChange={handleValueChange}
        handleEnableNext={handleEnableNext}
      />
    ) : null;
  };

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
                onChange={() => forceUpdate()}
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
