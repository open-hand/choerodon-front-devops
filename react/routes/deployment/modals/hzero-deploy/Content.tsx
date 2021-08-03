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

  // 记录点击展开下拉内容的HZERO服务record的index
  const [recordIndex, setRecordIndex] = useState<number | never>();

  const menuData = useMemo(() => ([
    {
      name: 'hzero-1',
      id: '111',
      isRequired: true,
      instanceName: 'instance-1',
      values: 'aa',
    }, {
      name: 'hzero-2',
      id: '222',
      instanceName: 'instance-2',
      values: 'bbb',
    }, {
      name: 'hzero-3',
      id: '333',
      instanceName: 'instance-3',
      values: 'ccc',
    }, {
      name: 'hzero-4',
      id: '444',
      instanceName: 'instance-4',
      values: 'ddd',
    }, {
      name: 'hzero-5',
      id: '555',
      instanceName: 'instance-5',
      values: 'eee',
    },
  ]), []);

  const handleSelect = useCallback(({ domEvent, key }) => {
    eventStopProp(domEvent);
    const data = menuData.find((item) => item.id === key);
    data && recordIndex && serviceDs.get(recordIndex)?.set(data);
  }, [recordIndex]);

  const menu = useMemo(() => (
    <Menu onClick={handleSelect}>
      {map(menuData, ({ id, name }) => (serviceDs.some((serviceRecord) => serviceRecord.get('id') === id)
        ? null : <Menu.Item key={id}>{name}</Menu.Item>))}
    </Menu>
  ), [handleSelect, serviceDs.records]);

  const handleClickExpand = useCallback((e, record: Record) => {
    eventStopProp(e);
    setRecordIndex(record.index);
  }, []);

  const serviceClassNames = useCallback((record: Record) => classnames(
    `${prefixCls}-content-service-item`,
    {
      selected: record === serviceDs.current,
      disabled: record.get('isRequired'),
    },
  ), [serviceDs.current]);

  const handleDeleteService = useCallback((e, record: Record) => {
    eventStopProp(e);
    serviceDs.remove(record);
  }, []);

  const handleAddService = useCallback(() => {
    serviceDs.create();
  }, []);

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
    disabled: !envRecord.get('permission') || !envRecord.get('connect'),
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
                key={serviceRecord.id}
                className={serviceClassNames(serviceRecord)}
                onClick={() => handleClickService(serviceRecord)}
                role="none"
              >
                <span>
                  {serviceRecord.get('name') || formatMessage({ id: `${intlPrefix}.placeholder` })}
                </span>
                {serviceRecord.get('isRequired') ? (
                  <span className={`${prefixCls}-content-service-required`}>必选</span>
                ) : (
                  <div className={`${prefixCls}-content-service-btn`}>
                    <Button
                      icon="delete_forever-o"
                      funcType={FuncType.flat}
                      onClick={(e) => handleDeleteService(e, serviceRecord)}
                    />
                    <Dropdown
                      overlay={menu}
                      // @ts-ignore
                      trigger={['click']}
                      placement={'bottomRight' as Placements}
                      popupClassName={`${prefixCls}-dropdown-popup`}
                    >
                      <Button
                        icon="expand_more"
                        funcType={FuncType.flat}
                        onClick={(e) => handleClickExpand(e, serviceRecord)}
                      />
                    </Dropdown>
                  </div>
                )}
              </div>
            ))}
            <Button
              onClick={handleAddService}
              funcType={FuncType.flat}
              className={`${prefixCls}-content-service-add`}
              icon="add"
            >
              {formatMessage({ id: `${intlPrefix}.add` })}
            </Button>
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
