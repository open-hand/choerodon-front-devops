import React, {
  ReactNode,
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Form,
  TextField,
  SelectBox,
  Password,
  Spin,
  Select,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import classnames from 'classnames';
import { Record, RecordObjectProps } from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import EnvOption from '@/components/env-option';
import { useHzeroDeployStore } from './stores';

import './index.less';

const HzeroDeploy = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    projectId,
    modal,
    formDs,
    serviceDs,
  } = useHzeroDeployStore();

  const serviceClassNames = useCallback((record: Record) => classnames(
    `${prefixCls}-content-service-item`,
    {
      selected: record === serviceDs.current,
      disabled: record.get('isRequired'),
    },
  ), [serviceDs.current]);

  const handleClickService = useCallback((record: Record) => {
    serviceDs.current = record;
  }, []);

  const ChangeConfigValue = useCallback((value) => {
    serviceDs.current?.set('values', value);
  }, [serviceDs.current]);

  const handleEnableNext = useCallback((flag: boolean) => {
    serviceDs.current?.set('valueFailed', flag);
  }, [serviceDs.current]);

  const renderEnvOption = useCallback(({
    record, text,
  }: { record: Record, text: string }) => (
    <EnvOption record={record} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  return (
    <div className={`${prefixCls}`}>
      <Form dataSet={formDs} columns={5}>
        <Select
          name="environmentId"
          searchable
          clearButton={false}
          optionRenderer={renderEnvOption}
          onOption={renderOptionProperty}
          colSpan={2}
        />
        <Select
          name="appVersionId"
          searchable
          clearButton={false}
          colSpan={2}
        />
      </Form>
      {serviceDs.length ? (
        <div className={`${prefixCls}-content`}>
          <div className={`${prefixCls}-content-service`}>
            {serviceDs.map((serviceRecord: Record) => (
              <div
                className={serviceClassNames(serviceRecord)}
                onClick={() => handleClickService(serviceRecord)}
                role="none"
              >
                <span>{serviceRecord.get('name')}</span>
              </div>
            ))}
          </div>
          <Form
            record={serviceDs.current}
            columns={2}
            className={`${prefixCls}-content-form`}
          >
            <Select
              name="serviceVersionId"
              searchable
              clearButton={false}
            />
            <TextField name="instanceName" />
            <YamlEditor
              colSpan={2}
              readOnly={false}
              value={serviceDs?.current?.get('values') || ''}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
            />
          </Form>
        </div>
      ) : null}
    </div>
  );
});

export default HzeroDeploy;
