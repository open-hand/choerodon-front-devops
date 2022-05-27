import React from 'react';
import { StatusTag, Loading } from '@choerodon/components';
import './index.less';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { useAppDetailsStore } from '../../../../stores';
import monitorSvg from '@/routes/app-center-pro/assets/monitor_empty.svg';
import { deployAppCenterApi } from '@/api';

const prefixCls = 'c7ncd-app-center-appMonitor-runDetailsOfHost';

const AppMonitor = () => {
  const {
    appDs,
    appId,
    enableAppMonitor,
  } = useAppDetailsStore();
  const {
    metricDeployStatus,
    envConnected,
  } = appDs.current?.toData() || {};

  return (
    <div className={prefixCls}>
      {metricDeployStatus === false
        ? (
          <div className={`${prefixCls}-empty`}>
            <img src={monitorSvg} />
            <div className={`${prefixCls}-empty-content`}>
              当前应用暂未开启监控，
            </div>
            <div className={`${prefixCls}-empty-content1`}>
              <Tooltip title={!envConnected ? '环境状态未连接，无法执行此操作。' : ''}>
                <Button funcType={'link' as any} disabled={!envConnected} onClick={enableAppMonitor}>【开启】</Button>
              </Tooltip>
              后便可监控应用的异常与停机
            </div>
          </div>
        ) : ''}
    </div>
  );
};

export default observer(AppMonitor);
