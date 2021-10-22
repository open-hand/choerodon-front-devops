import React from 'react';
import { observer, Observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
import { useDebounceFn } from 'ahooks';
import { LabelLayoutType } from '@/interface';
import { useHostConfigStore } from '../../stores';

import './index.less';

const ContentHeader: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    formatMessage,
    searchDs,
    listDs,
    showTestTab,
    hasExtraTab,
    tab,
  } = useHostConfigStore();

  const handleSearch = () => {
    listDs.query();
  };

  const { run } = useDebounceFn(handleSearch, {
    wait: 500,
  });

  return (
    <div className={`${prefixCls}-content-search`}>
      {showTestTab && hasExtraTab && tab}
      <div className={`${prefixCls}-content-search-form-wrap`}>
        <Form
          dataSet={searchDs}
          columns={3}
          className={`${prefixCls}-content-search-form`}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          <TextField
            clearButton
            name="search_param"
            colSpan={2}
            placeholder="请输入搜索条件"
            prefix={<Icon type="search" />}
            onInput={run}
            valueChangeAction={'input' as any}
          />
          <Select
            placeholder="主机状态:"
            name="host_status"
            colSpan={1}
            onChange={handleSearch}
          />
        </Form>
        <Button
          onClick={() => {
            searchDs.reset();
            listDs.query();
          }}
          className={`${prefixCls}-content-search-btn`}
          disabled={listDs.status === 'loading'}
        >
          {formatMessage({ id: 'reset' })}
        </Button>
      </div>
    </div>
  );
});

export default ContentHeader;
