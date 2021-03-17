import React from 'react';
import { observer } from 'mobx-react-lite';
import { Breadcrumb } from '@choerodon/boot';
import { inject } from 'mobx-react';
import { useCodeManagerStore } from '../stores';
import './index.less';

const CodeManagerHeader = inject('AppState')(observer((props) => {
  const {
    prefixCls,
    codeManagerStore: { getNoHeader },
  } = useCodeManagerStore();

  const { breadCrumb } = props;

  return (
    <div className="c7ncd-code-manager">
      {!getNoHeader && <div className={`${prefixCls}-header-placeholder`} />}
      <Breadcrumb
        className={`${prefixCls}-header-no-bottom`}
        {...breadCrumb}
      />
    </div>
  );
}));

export default CodeManagerHeader;
