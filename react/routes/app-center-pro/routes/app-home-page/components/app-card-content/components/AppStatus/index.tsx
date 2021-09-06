import React from 'react';
import { Icon, Spin } from 'choerodon-ui/pro';
import { StatusTag } from '@choerodon/components';
import { APP_STATUS, ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';

const AppStatus = ({
  status,
  deloyType,
  subfixCls,
}:{
  status: keyof typeof APP_STATUS
  deloyType: typeof ENV_TAB | typeof HOST_TAB
  subfixCls:string
}) => {
  const statusCls = `${subfixCls}-list-card-status ${subfixCls}-list-card-status-${status}`;

  const getTagEnv = () => {
    let tag:any = '';
    switch (status) {
      case APP_STATUS.FAILED:
        tag = (
          <Icon
            className={statusCls}
            type="info"
          />
        );
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
          <div className={`${subfixCls}-list-card-status`}>
            <StatusTag type="border" colorCode="failed" name="失败" />
            <Icon
              className={statusCls}
              type="info"
            />
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
