import React from 'react';
import './index.less';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip, Spin } from 'choerodon-ui/pro';
import monitorSvg from '@/routes/app-center-pro/assets/monitor_empty.svg';
import { DataProps } from './type';
import NumberChart from './components/numberChart';
import DurationChart from './components/durationChart';

const prefixCls = 'c7ncd-app-center-appMonitor';

const AppMonitor = (props:DataProps) => {
  const {
    enableAppMonitor,
    appDs,
    getCurrentNumberResult,
    getCurrentDurationResult,
    numberData,
    durationData,
  } = props;
  const {
    envConnected, connect,
  } = appDs.current?.toData() || {};
  const metricDeployStatus = appDs.current?.toData()?.metricDeployStatus
  || appDs.current?.toData().devopsDeployAppCenterEnvDTO?.metricDeployStatus;

  const renderChart = () => (
    (numberData && durationData)
      ? (
        <div>
          <NumberChart
            getCurrentNumberResult={getCurrentNumberResult}
            numberData={numberData}
          />
          <DurationChart
            getCurrentDurationResult={getCurrentDurationResult}
            durationData={durationData}
          />
        </div>
      )
      : (
        <div className={`${prefixCls}-spin`}>
          <Spin />
        </div>
      )
  );

  return (
    <div className={prefixCls}>
      {!metricDeployStatus
        ? (
          <div className={`${prefixCls}-empty`}>
            <img src={monitorSvg} />
            <div className={`${prefixCls}-empty-content`}>
              当前应用暂未开启监控，
            </div>
            <div className={`${prefixCls}-empty-content1`}>
              <Tooltip title={!(envConnected || connect) ? '环境状态未连接，无法执行此操作。' : ''}>
                <Button funcType={'link' as any} disabled={!(envConnected || connect)} onClick={enableAppMonitor}>【开启】</Button>
              </Tooltip>
              后便可监控应用的异常与停机
            </div>
          </div>
        ) : renderChart()}
    </div>
  );
};
export default observer(AppMonitor);
