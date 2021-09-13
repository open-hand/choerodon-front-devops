import React, {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Choerodon } from '@choerodon/boot';
import {
  Button, Form, Select, TextField, Axios,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { useUpgradeStore } from './stores';
import YamlEditor from '@/components/yamlEditor';
import { HzeroGetYamlApi } from '@/api/HzeroYaml';

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
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(''); // 左边的数据
  const [originValue, setOriginValue] = useState(''); // 右边的数据

  useEffect(() => {
    if (record?.get('instanceId')) {
      const id = record?.get('instanceId');
      setLoading(true);
      HzeroGetYamlApi.getCurrentVersionYaml(id).then((res:any) => {
        setLoading(false);
        setValues(res.yaml);
        record.set('values', res.yaml);
      });
    }
  }, [record, record?.get('instanceId')]);

  useEffect(() => {
    setHasEditorError(false);
    modal.update({ okProps: { disabled: false } });
    if (record?.get('marketDeployObjectId')) {
      const id = record?.get('marketDeployObjectId');
      setLoading(true);
      HzeroGetYamlApi.getOtherVersionYaml(record.get('instanceId'), id).then((res:any) => {
        setLoading(false);
        setOriginValue(res.yaml);
      });
    }
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
      <Spin spinning={loading}>
        <YamlEditor
          readOnly={false}
          value={values}
          originValue={originValue}
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
          viewMode="diff"
          LEGEND_TYPE={['modify']}
        />
      </Spin>
    </>
  );
});

export default HzeroUpgrade;
