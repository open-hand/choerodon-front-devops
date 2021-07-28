import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button, Form, Icon, Select, TextField,
} from 'choerodon-ui/pro';
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

  return (
    <div className={`${prefixCls}-content-search`}>
      {showTestTab && hasExtraTab && tab}
      <div className={`${prefixCls}-content-search-form-wrap`}>
        <Form
          dataSet={searchDs}
          columns={7}
          className={`${prefixCls}-content-search-form`}
          labelLayout={'horizontal' as LabelLayoutType}
          labelWidth={1}
        >
          <TextField
            clearButton
            name="search_param"
            colSpan={4}
            placeholder="请输入搜索条件"
            prefix={<Icon type="search" />}
            onClear={handleSearch}
          />
          <Select
            prefix="主机状态:"
            name="host_status"
            colSpan={3}
            onClear={handleSearch}
          />
        </Form>
        <Button
          onClick={handleSearch}
          className={`${prefixCls}-content-search-btn`}
          disabled={listDs.status === 'loading'}
        >
          {formatMessage({ id: 'search' })}
        </Button>
      </div>
    </div>
  );
});

export default ContentHeader;
