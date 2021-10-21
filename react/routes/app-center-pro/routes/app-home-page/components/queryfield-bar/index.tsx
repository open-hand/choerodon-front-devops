/* eslint-disable max-len */
import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { CustomTabs } from '@choerodon/components';
import map from 'lodash/map';
import debounce from 'lodash/debounce';
import { LabelLayoutType, RecordObjectProps } from '@/interface';

import EnvOption from '@/components/env-option';

import './index.less';
import { useAppHomePageStore } from '../../stores';
import { ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

const ContentHeader: React.FC<any> = observer((): any => {
  const {
    subfixCls,
    listDs,
    ALL_ENV_KEY,
    typeTabKeys,
    searchDs,
    intlPrefix,
    formatMessage,
    refresh,
  } = useAppHomePageStore();

  const isEnvTab = searchDs.current?.get('typeKey') === typeTabKeys.ENV_TAB;

  const newPrefixCls = useMemo(() => `${subfixCls}-search`, []);

  const handleTypeChange = (key:typeof ENV_TAB | typeof HOST_TAB) => {
    refresh(key);
  };

  const renderEnvOption = useCallback(({ record, text, value }) => (
    value === ALL_ENV_KEY ? (
      <span style={{ paddingLeft: '12px' }}>
        {text}
      </span>
    ) : <EnvOption record={record} text={text} />
  ), []);

  const renderHostOption = useCallback(({ record, text, value }) => (
    value === ALL_ENV_KEY ? (
      <span style={{
        paddingLeft: '12px',
      }}
      >
        {text}
      </span>
    ) : <EnvOption connect={record.get('hostStatus') === 'connected'} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  const handleFormChange = () => {
    listDs.query();
  };

  return (
    <div className={newPrefixCls}>
      <CustomTabs
        onChange={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>, tabName: string, tabKey: typeof ENV_TAB | typeof HOST_TAB,
        ) => handleTypeChange(tabKey)}
        data={map(typeTabKeys, (value, key) => ({
          name: formatMessage({ id: `${intlPrefix}.tab.${key}` }),
          value,
        }))}
        selectedTabValue={searchDs.current?.get('typeKey')}
        className={`${newPrefixCls}-tab`}
      />
      <div
        className={`${newPrefixCls}-form-wrap`}
        role="none"
      >
        <Form
          dataSet={searchDs}
          columns={3}
          className={`${newPrefixCls}-form`}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          {isEnvTab ? (
            <Select
              prefix="环境:"
              name="env_id"
              colSpan={3}
              searchable
              key="env"
              clearButton={false}
              optionRenderer={renderEnvOption}
              onOption={renderOptionProperty}
              onChange={handleFormChange}
            />
          ) : (
            <Select
              prefix="主机:"
              name="host_id"
              key="host"
              colSpan={3}
              searchable
              clearButton={false}
              optionRenderer={renderHostOption}
              onChange={handleFormChange}
            />
          )}
        </Form>
        <Form
          dataSet={searchDs}
          className={`${newPrefixCls}-form-params`}
          columns={4}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          <TextField
            placeholder="请输入搜索条件"
            name="params"
            colSpan={2}
            prefix={
              <Icon type="search" />
            }
            clearButton
            onInput={(e:any) => {
              searchDs.current?.set('params', e.currentTarget?.value);
              listDs.query();
            }}
          />
          <Select
            name="operation_type"
            colSpan={isEnvTab ? 1 : 2}
            placeholder="操作类型："
            onChange={handleFormChange}
          />
          {isEnvTab && (
          <Select
            placeholder="应用类型："
            name="rdupm_type"
            colSpan={1}
            clearButton
            onChange={handleFormChange}
          />
          )}
        </Form>
        <Button
          onClick={() => {
            searchDs.reset();
            listDs.query();
          }}
          className={`${newPrefixCls}-btn`}
          disabled={listDs.status === 'loading'}
        >
          {formatMessage({ id: 'reset' })}
        </Button>
      </div>
    </div>
  );
});

export default ContentHeader;
