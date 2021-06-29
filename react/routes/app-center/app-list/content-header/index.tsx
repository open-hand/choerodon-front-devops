import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { CustomTabs } from '@choerodon/components';
import StatusDot from '@/components/status-dot';
import map from 'lodash/map';
import { LabelLayoutType } from '@/interface';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';
import EnvOption from '@/routes/app-center/components/env-option';

import './index.less';

const ContentHeader: React.FC<any> = observer((): any => {
  const {
    intlPrefix,
    prefixCls,
    formatMessage,
    searchDs,
    listDs,
    mainStore,
    tabKeys,
  } = useAppCenterListStore();

  const newPrefixCls = useMemo(() => `${prefixCls}-list-search`, []);

  const refresh = useCallback(() => {
    listDs.query();
  }, []);

  const setQueryParameter = useCallback(({ type, params }: { type: string, params: string | ''}) => {
    listDs.setQueryParameter('type', type);
    listDs.setQueryParameter('params', params);
  }, []);

  const handleChange = (key:string) => {
    searchDs.reset();
    setQueryParameter({ type: key, params: '' });
    mainStore.setCurrentTabKey(key);
    refresh();
  };

  const handleSearch = () => {
    const { params }:any = searchDs.toData()[0];
    setQueryParameter({ type: mainStore.getCurrentTabKey, params });
    refresh();
  };

  const renderEnvOption = useCallback(({ record, text }) => (
    <EnvOption record={record} text={text} />
  ), []);

  return (
    <div className={newPrefixCls}>
      <CustomTabs
        onChange={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent>, tabName: string, tabKey: string,
        ) => handleChange(tabKey)}
        data={map(tabKeys, (value, key) => ({
          name: formatMessage({ id: `${intlPrefix}.list.tab.${key}` }),
          value,
        }))}
        selectedTabValue={mainStore.getCurrentTabKey}
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
            onClear={handleSearch}
          />
          <Select
            label="环境:"
            name="env"
            colSpan={3}
            searchable
            placeholder="请选择"
            optionRenderer={renderEnvOption}
            onClear={handleSearch}
          />
        </Form>
        <Button
          onClick={handleSearch}
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
