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
  Icon,
  Select,
  Menu,
  Dropdown,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import classnames from 'classnames';
import eventStopProp from '@/utils/eventStopProp';
import {
  Record, RecordObjectProps, FuncType, Placements,
} from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import { useHzeroDeployDetailStore } from './stores';

import './index.less';

const HzeroDeployDetail = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    projectId,
    modal,
    formDs,
    serviceDs,
    status,
  } = useHzeroDeployDetailStore();

  useEffect(() => {
    if (status === 'failed') {
      modal.update({
        okCancel: true,
        okText: formatMessage({ id: 'retry' }),
      });
    }
    if (status === 'operating') {
      modal.update({
        okCancel: true,
        okText: formatMessage({ id: `${intlPrefix}.stop` }),
      });
    }
  }, []);

  const getStatusIcon = useCallback((record: Record) => {
    const serviceStatus = record.get('status');
    const className = classnames(`${prefixCls}-status-icon`, { [serviceStatus]: true });
    let content;
    switch (serviceStatus) {
      case 'success':
        content = <Icon type="check_circle" className={className} />;
        break;
      case 'failed':
        content = <Icon type="cancel" className={className} />;
        break;
      case 'wait':
        content = <Icon type="remove_circle" className={className} />;
        break;
      default:
    }
    return content;
  }, []);

  const serviceClassNames = useCallback((record: Record) => classnames(
    `${prefixCls}-content-service-item`,
    {
      selected: record === serviceDs.current,
    },
  ), [serviceDs.current]);

  const handleClickService = useCallback((record: Record) => {
    serviceDs.current = record;
  }, []);

  const ChangeConfigValue = useCallback((value) => {
    serviceDs.current?.set('value', value);
  }, [serviceDs.current]);

  const handleEnableNext = useCallback((flag: boolean) => {
    serviceDs.current?.set('valueFailed', flag);
  }, [serviceDs.current]);

  return (
    <div className={`${prefixCls}`}>
      <Form dataSet={formDs} columns={5}>
        <SelectBox name="type" colSpan={2} disabled />
        <TextField
          name="environmentDTO"
          colSpan={2}
          disabled
          newLine
        />
        <TextField
          name="mktAppVersion"
          colSpan={2}
          disabled
        />
      </Form>
      {serviceDs.length ? (
        <div className={`${prefixCls}-content`}>
          <div className={`${prefixCls}-content-service`}>
            {serviceDs.map((serviceRecord: Record) => (
              <div
                key={serviceRecord.id}
                className={serviceClassNames(serviceRecord)}
                onClick={() => handleClickService(serviceRecord)}
                role="none"
              >
                <span>
                  {serviceRecord.get('mktServiceName') || formatMessage({ id: `${intlPrefix}.placeholder` })}
                </span>
                {getStatusIcon(serviceRecord)}
              </div>
            ))}
          </div>
          <Form
            record={serviceDs.current}
            columns={2}
            className={`${prefixCls}-content-form`}
          >
            <TextField name="mktServiceVersion" disabled />
            <TextField name="instanceCode" disabled />
            <YamlEditor
              colSpan={2}
              readOnly={status !== 'failed'}
              value={serviceDs?.current?.get('value') || ''}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
            />
          </Form>
        </div>
      ) : null}
    </div>
  );
});

export default HzeroDeployDetail;
