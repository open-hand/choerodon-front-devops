import React, {
  useEffect, useMemo, useState, Fragment, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/boot';
import {
  Button, Form, Select, TextField,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { useUpgradeStore } from './stores';
import YamlEditor from '../../../../../../../components/yamlEditor';

const marketUpgrade = observer(() => {
  const {
    formatMessage,
    projectId,
    intlPrefix,
    prefixCls,
    formDs,
    refresh,
    modal,
    valueDs,
    defaultData: {
      marketAppServiceId,
      marketDeployObjectId,
    },
    location: { search },
    versionsDs,
  } = useUpgradeStore();

  const record = useMemo(() => formDs.current, [formDs.current]);

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
      if (await formDs.submit() !== false) {
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

  const getButtonContent = useMemo(() => {
    const spanDom = <span>查看版本详情</span>;
    const deployObjectRecord = record ? versionsDs.find((eachRecord) => eachRecord.get('id') === record.get('marketDeployObjectId')) : null;
    const marketAppId = deployObjectRecord ? deployObjectRecord.get('marketAppId') : null;
    if (marketAppId) {
      return (
        <a
          href={`${window.location.origin}/#/market/app-market/app-detail/${marketAppId}${search}`}
          rel="nofollow me noopener noreferrer"
          target="_blank"
          className={`${prefixCls}-btn-link`}
        >
          {spanDom}
        </a>
      );
    }
    return spanDom;
  }, [record, search, versionsDs.records]);

  const renderVersion = useCallback(({ value, text }) => {
    if (value === text) {
      return '';
    }
    return text;
  }, []);

  if (!record) {
    return <Spin spinning />;
  }

  return (
    <>
      <Form dataSet={formDs} columns={3}>
        <TextField name="marketServiceName" disabled />
        <Select
          name="marketDeployObjectId"
          clearButton={false}
          className={`${prefixCls}-select`}
          renderer={renderVersion}
        />
        <Button
          className={`${prefixCls}-btn`}
          disabled={!marketAppServiceId}
        >
          {getButtonContent}
        </Button>
      </Form>
      <Spin spinning={valueDs.status === 'loading'}>
        {getValue}
      </Spin>
    </>
  );
});

export default marketUpgrade;
