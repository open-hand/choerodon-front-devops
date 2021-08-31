import React from 'react';
import { StatusTag, Loading } from '@choerodon/components';
import './index.less';
import { observer } from 'mobx-react-lite';
import { useAppDetailsStore } from '../../../../stores';

const prefixCls = 'c7ncd-app-center-appDetail-runDetailsOfHost';

const RunDetailsOfHost = () => {
  const {
    appDs,
  } = useAppDetailsStore();

  const {
    status,
    pid,
    ports,
  } = appDs.current?.toData() || {};

  if (appDs.status === 'loading') {
    return <Loading />;
  }

  return (
    <div className={prefixCls}>
      <div>
        {status ? <StatusTag colorCode={status} name={status?.toUpperCase()} /> : '-'}
        <span>状态</span>
      </div>
      <div>
        <span>{pid || '-'}</span>
        <span>进程号</span>
      </div>
      <div>
        <span>{ports || '-'}</span>
        <span>占用端口</span>
      </div>
    </div>
  );
};

export default observer(RunDetailsOfHost);
