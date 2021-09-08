import React from 'react';
import { Icon, Spin, Tooltip } from 'choerodon-ui/pro';
import { StatusTag } from '@choerodon/components';
import { APP_STATUS, ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';
import './index.less';

const prefixcls = 'c7ncd-app-center-appStatus';

const AppStatus = ({
  status,
  deloyType,
  error,
}:{
  status: keyof typeof APP_STATUS
  deloyType: typeof ENV_TAB | typeof HOST_TAB
  error:string
}) => {
  const statusCls = `${prefixcls}-status ${prefixcls}-status-${status}`;

  const ErrorIcon = () => (
    <Tooltip title={error}>
      <Icon
        className={statusCls}
        type="info"
      />
    </Tooltip>
  );

  const ErrorIcon = () => (
    <Tooltip title={error}>
      <Icon
        className={statusCls}
        type="info"
      />
    </Tooltip>
  );

  const getTagEnv = () => {
    let tag:any = '';
    switch (status) {
      case APP_STATUS.FAILED:
        tag = <ErrorIcon />;
        break;
      case APP_STATUS.OPERATING:
        tag = (
          <Spin className={statusCls} />
        );
        break;
      default:
        break;
    }
    return tag;
  };

  const getTagHost = () => {
    let tag:any = '';
    switch (status) {
      case APP_STATUS.FAILED:
        tag = (
          <div className={`${prefixcls}-status`}>
            <StatusTag type="border" colorCode="failed" name="失败" />
            <ErrorIcon />
          </div>
        );
        break;
      case APP_STATUS.OPERATING:
        tag = (
          <StatusTag colorCode="operating" name="处理中" />
        );
        break;
      default:
        break;
    }
    return tag;
  };

  return deloyType === ENV_TAB ? getTagEnv() : getTagHost();
};

export default AppStatus;
