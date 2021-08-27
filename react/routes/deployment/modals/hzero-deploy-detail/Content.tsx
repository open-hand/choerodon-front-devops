import React, {
  useCallback, useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Form,
  Icon,
  Output,
  Tooltip,
} from 'choerodon-ui/pro';
import classnames from 'classnames';
import { StatusTag } from '@choerodon/components';
import { useHistory } from 'react-router';
import {
  Record, LabelLayoutType, LabelAlignType,
} from '@/interface';
import YamlEditor from '@/components/yamlEditor';
import { deployRecordApi } from '@/api';
import STATUS_TYPE from '@/constants/STATUS_TYPE';
import Loading from '@/components/loading';
import { useHzeroDeployDetailStore } from './stores';
import { getConsumeDuration } from '@/utils/getDuration';

import './index.less';

const HzeroDeployDetail = observer(() => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    modal,
    formDs,
    serviceDs,
    status,
    recordId,
    refresh,
    handleHzeroStop,
  } = useHzeroDeployDetailStore();

  const history = useHistory();

  useEffect(() => {
    switch (status) {
      case 'canceled':
      case 'failed':
        modal.update({
          okCancel: true,
          okText: formatMessage({ id: 'c7ncd.deploy.retry' }),
          onOk: handleRetry,
        });
        break;
      case 'operating':
        modal.update({
          okCancel: true,
          okText: formatMessage({ id: `${intlPrefix}.stop` }),
          onOk: () => handleHzeroStop(recordId),
        });
        break;
      default:
    }
  }, []);

  const handleRetry = useCallback(async () => {
    try {
      const data = {
        deployDetailsVOList: serviceDs.toData(),
      };
      await deployRecordApi.retryRecord(recordId, data);
      refresh();
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const getStatusIcon = useCallback((record: Record) => {
    const serviceStatus = record.get('status');
    // @ts-ignore
    const { icon, name, color } = STATUS_TYPE[serviceStatus] || {};
    return (
      <Tooltip title={name}>
        <Icon type={icon} style={{ color }} className={`${prefixCls}-status-icon`} />
      </Tooltip>
    );
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

  const getStatusTag = useCallback((state) => (
    <StatusTag
      colorCode={state || ''}
      name={state ? formatMessage({ id: `${intlPrefix}.status.deleted` }) : 'unKnown'}
      style={{ width: '40px', marginLeft: '10px' }}
    />
  ), []);
  const toInstanceDetail = (record: any) => {
    history.push(`/devops/application-center/detail/${record.get('appId')}/hzero/env/${formDs.current?.get('environmentDTO')?.id}/chart`);
  };
  const renderInstanceCode = (record: any) => (
    <div style={{ display: 'flex' }}>
      <div role="none" style={(record.get('appStatus') === 'deleted' || record.get('appStatus') === 'notExist') ? { opacity: '0.5' } : { color: '#415BC9' }} onClick={() => toInstanceDetail(record)}>
        {record.get('instanceCode')}
      </div>
      <div>{record.get('appStatus') === 'deleted' ? getStatusTag(record.get('appStatus')) : ''}</div>
    </div>
  );
  if (formDs.status === 'loading') {
    return <Loading display />;
  }

  return (
    <div className={`${prefixCls} ${prefixCls}-detail`}>
      <Form
        dataSet={formDs}
        columns={2}
        labelLayout={'horizontal' as LabelLayoutType}
        labelAlign={'left' as LabelAlignType}
        className={`${prefixCls}-detail-form`}
        labelWidth="auto"
      >
        <Output
          name="type"
          renderer={({ value }) => value && formatMessage({ id: `${intlPrefix}.type.${value}` })}
          className={`${prefixCls}-detail-type`}
        />
        <Output
          name="environmentDTO"
          renderer={({ value }) => value?.name}
        />
        <Output name="mktAppVersion" />
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
          <div className={`${prefixCls}-content-form`}>
            <Form
              record={serviceDs.current}
              columns={2}
              labelLayout={'horizontal' as LabelLayoutType}
              labelAlign={'left' as LabelAlignType}
              labelWidth="auto"
            >
              <Output name="mktServiceVersion" />
              <Output label="实例名称" value={renderInstanceCode(serviceDs.current)} />
              <Output name="startTime" />
              <Output label="部署耗时" value={getConsumeDuration(serviceDs.current?.get('startTime'), serviceDs.current?.get('endTime'))} />
            </Form>
            <YamlEditor
              colSpan={2}
              readOnly={!['failed', 'canceled'].includes(status)}
              value={serviceDs?.current?.get('value') || ''}
              onValueChange={ChangeConfigValue}
              handleEnableNext={handleEnableNext}
              className={`${prefixCls}-detail-yaml`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default HzeroDeployDetail;
