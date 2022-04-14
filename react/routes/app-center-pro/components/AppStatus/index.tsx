import React from 'react';
import { Icon, Spin, Tooltip } from 'choerodon-ui/pro';
import { StatusTag } from '@choerodon/components';
import { Tag } from 'choerodon-ui';
import { APP_STATUS, ENV_TAB, HOST_TAB } from '@/routes/app-center-pro/stores/CONST';
import './index.less';

const prefixcls = 'c7ncd-app-center-appStatus';

const tagColorMap: any = {
  running: 'green',
  other: 'volcano',
  exited: 'gray',
};

const AppStatus = ({
  status,
  deloyType,
  error,
  outsideStatus,
  rdupmType,
}: any) => {
  const statusCls = `${prefixcls}-status ${prefixcls}-status-${status}`;

  const ErrorIcon = () => {
    const titleDom = error?.split('\n')?.map((e) => (
      <p style={{ margin: 0 }}>{e}</p>
    ));
    return (
      <Tooltip
        title={titleDom}
        popupStyle={{
          maxHeight: 500,
          overflow: 'auto',
        }}
      >
        <Icon
          className={statusCls}
          type="info"
        />
      </Tooltip>
    );
  };

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
    if (rdupmType === 'docker_compose') {
      tag = (
        <div className={`${prefixcls}-status`}>
          <Tag style={{ marginRight: 0 }} color={tagColorMap[outsideStatus]}>{ outsideStatus }</Tag>
          {
            status === APP_STATUS.FAILED ? (
              <ErrorIcon />
            ) : ''
          }
        </div>
      );
    } else {
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
            <div className={`${prefixcls}-status`}>
              <StatusTag colorCode="operating" name="处理中" />
            </div>
          );
          break;
        default:
          break;
      }
    }
    return tag;
  };

  return deloyType === ENV_TAB ? getTagEnv() : getTagHost();
};

export default AppStatus;
