/* eslint-disable max-len */
import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { CustomTabs, FilterTextField } from '@choerodon/components';
import map from 'lodash/map';
import { LabelLayoutType, RecordObjectProps } from '@/interface';

import EnvOption from '@/components/env-option';

import './index.less';
import { useAppHomePageStore } from '../../stores';
import { APP_OPERATION, ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

const ContentHeader: React.FC<any> = observer((): any => {
  const {
    subfixCls,
    listDs,
    mainStore,
    ALL_ENV_KEY,
    typeTabKeys,
    searchDs,
    intlPrefix,
    formatMessage,
    refresh,
  } = useAppHomePageStore();

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

  const renderFilterDatas = useCallback(() => {
    const res: {
      field: string,
      label: string,
      options?: any[]
    }[] = [
      {
        field: 'name',
        label: '应用名称',
      },
      {
        field: 'operation_type',
        label: '操作类型',
        options: map(APP_OPERATION, (value:keyof typeof APP_OPERATION) => ({
          name: formatMessage({ id: `c7ncd.app.operation.type.${value}` }),
          value,
        })),
      },
    ];
    if (mainStore.getCurrentTypeTabKey === ENV_TAB) {
      res.push({
        field: 'rdupm_type',
        label: '应用类型',
        options: [
          {
            name: 'chart包',
            value: 'chart',
          },
          {
            name: '部署组',
            value: 'deployment',
          },
        ],
      });
    }
    return res;
  }, [mainStore.getCurrentTypeTabKey]);

  const setQueryFields = (data:any) => {
    searchDs.reset();
    const record = searchDs.current;
    if (data && data.length) {
      data.forEach((item:any) => {
        const {
          field,
          value,
        } = item || {};
        if (value) {
          record?.set(field || 'params', value?.value || value);
        }
      });
    }
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
        selectedTabValue={mainStore.getCurrentTypeTabKey}
        className={`${newPrefixCls}-tab`}
      />
      <div className={`${newPrefixCls}-form-wrap`}>
        <Form
          dataSet={searchDs}
          columns={3}
          className={`${newPrefixCls}-form`}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          {mainStore.getCurrentTypeTabKey === typeTabKeys.ENV_TAB ? (
            <Select
              prefix="环境:"
              name="env_id"
              colSpan={3}
              searchable
              optionRenderer={renderEnvOption}
              onOption={renderOptionProperty}
              onChange={() => refresh('env')}
            />
          ) : (
            <Select
              prefix="主机:"
              name="host_id"
              colSpan={3}
              searchable
              optionRenderer={renderHostOption}
              onChange={() => refresh('host')}
            />
          )}
        </Form>
        {/* <Form
          dataSet={searchDs}
          columns={4}
          className={`${newPrefixCls}-form`}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          <TextField
            clearButton
            name="params"
            colSpan={4}
            placeholder="请输入搜索条件"
            prefix={<Icon type="search" />}
            onClear={() => refresh()}
          />
        </Form> */}
        <FilterTextField
          filterMap={renderFilterDatas()}
          onSearch={setQueryFields}
          className={`${newPrefixCls}-filterText`}
        />
        <Button
          onClick={() => refresh()}
          className={`${newPrefixCls}-btn`}
          disabled={listDs.status === 'loading'}
        >
          {formatMessage({ id: 'search' })}
        </Button>
      </div>
    </div>
  );
});

export default ContentHeader;
