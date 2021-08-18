import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { CustomTabs } from '@choerodon/components';
import map from 'lodash/map';
import { LabelLayoutType, RecordObjectProps } from '@/interface';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';
import EnvOption from '@/components/env-option';

import './index.less';
import { useAppHomePageStore } from '../../stores';

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
  } = useAppHomePageStore();

  const newPrefixCls = useMemo(() => `${subfixCls}-search`, []);

  const refresh = useCallback(() => {
    listDs.query();
  }, []);

  const handleTypeChange = (key:string) => {
    listDs.setQueryParameter('typeKey', key);
    mainStore.setCurrentTypeTabKey(key);
    refresh();
  };

  const renderEnvOption = useCallback(({ record, text, value }) => (
    value === ALL_ENV_KEY ? text : <EnvOption record={record} text={text} />
  ), []);

  const renderHostOption = useCallback(({ record, text, value }) => (
    value === ALL_ENV_KEY ? text : <EnvOption connect={record.get('hostStatus') === 'connected'} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  return (
    <div className={newPrefixCls}>
      <CustomTabs
        onChange={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>, tabName: string, tabKey: string,
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
          columns={7}
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
            onClear={refresh}
          />
          {mainStore.getCurrentTypeTabKey === typeTabKeys.ENV_TAB ? (
            <Select
              prefix="环境:"
              name="envId"
              colSpan={3}
              searchable
              optionRenderer={renderEnvOption}
              onOption={renderOptionProperty}
              onClear={refresh}
            />
          ) : (
            <Select
              prefix="主机:"
              name="hostId"
              colSpan={3}
              searchable
              optionRenderer={renderHostOption}
              onClear={refresh}
            />
          )}
        </Form>
        <Button
          onClick={refresh}
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
