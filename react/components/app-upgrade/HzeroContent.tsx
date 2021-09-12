import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/boot';
import {
  Button, Form, Select, TextField,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { useUpgradeStore } from './stores';
import YamlEditor from '@/components/yamlEditor';

const HzeroUpgrade = observer(() => {
  const {
    prefixCls,
    formDsHzero,
    refresh,
    modal,
    valueDs,
    defaultData: {
      marketAppServiceId,
      marketDeployObjectId,
    },
    location: { search },
    versionsDs,
    isHzero,
  } = useUpgradeStore();

  const record = useMemo(() => formDsHzero.current, [formDsHzero.current]);

  const [hasEditorError, setHasEditorError] = useState(false);

  useEffect(() => {
    modal.update({
      okProps: { disabled: !record || record.get('marketDeployObjectId') === marketDeployObjectId },
    });
  }, [record, record?.get('marketDeployObjectId')]);

  modal.handleOk(async () => {
    if (hasEditorError) {
      return false;
    }
    try {
      if (await formDsHzero.submit() !== false) {
        refresh();
        return true;
      }
      return false;
    } catch (e) {
      Choerodon.handleResponseError(e);
      return false;
    }
  });

  const getValue = useMemo(() => {
    const yaml = valueDs.current ? valueDs.current.get('yaml') : '';
    const values = record ? record.get('values') : '';
    return (
      <YamlEditor
        readOnly={false}
        value={values || yaml || ''}
        originValue={yaml}
        handleEnableNext={handleNextStepEnable}
        onValueChange={handleChangeValue}
        customRightClasses={
            {
              chunk: 'CodeMirror-merge-r-chunk',
              start: 'CodeMirror-merge-r-chunk-start',
              end: 'CodeMirror-merge-r-chunk-end',
              insert: '',
              del: '',
              connect: 'CodeMirror-merge-r-connect',
            }
          }
        LEGEND_TYPE={['modify']}
        // showError={false}
      />
    );
  }, [record, valueDs.current]);

  const handleNextStepEnable = useCallback((flag: boolean) => {
    setHasEditorError(flag);
    modal.update({ okProps: { disabled: flag } });
  }, []);

  const handleChangeValue = useCallback((value: string) => {
    record && record.set('values', value);
  }, [record]);

  const renderForm = () => {
    if (isHzero) {
      return (
        <Form dataSet={formDsHzero} columns={3}>
          <TextField name="marketAppVersion" disabled />
          <Select
            name="marketDeployObjectId"
            clearButton={false}
            className={`${prefixCls}-select`}
          />
        </Form>
      );
    }
    return '';
  };

  if (!record) {
    return <Spin spinning />;
  }

  return (
    <>
      {renderForm()}
      <Spin spinning={valueDs.status === 'loading'}>
        {getValue}
      </Spin>
    </>
  );
});

export default HzeroUpgrade;
