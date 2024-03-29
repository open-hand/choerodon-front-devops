import React, { useCallback, useMemo } from 'react';
import { Action } from '@choerodon/master';
import {
  Tooltip, Modal, TextField, message,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import CopyToBoard from 'react-copy-to-clipboard';
import { UserInfo, TimePopover } from '@choerodon/components';
import HostConnect from '@/routes/host-config/components/connect-host';
import { SMALL } from '@/utils/getModalWidth';
import HostConfigApis from '@/routes/host-config/apis/DeployApis';
import StatusTagOutLine from '../../components/statusTagOutLine';
import eventStopProp from '../../../../../../utils/eventStopProp';
import { useHostConfigStore } from '../../../../stores';
import DeleteCheck from '../deleteCheck';

import './index.less';

const commandModalKey = Modal.key();

const HostsItem: React.FC<any> = observer(({
  // sshPort, // 主机ssh的端口
  hostStatus, // 主机状态
  // hostIp, // 主机ip
  name, // 主机名称
  id, // 主键
  // jmeterPort, // jmeter进程的端口号
  // jmeterStatus, // jmeter状态
  // authType, // 认证类型
  // type, // 主机类型 deploy / distribute_test
  // jmeterPath, // jmeter二进制文件的路径
  // username, // 用户名
  lastUpdateDate,
  creatorInfo,
  // listDs,
  record,
  // handleCreateTestHost,
  handleCreateDeployHost,
  showPermission, // 是否可见权限管理
}) => {
  const {
    prefixCls,
    formatMessage,
    intlPrefix,
    refresh,
    projectId,
    mainStore,
    loadData,
  } = useHostConfigStore();

  const itemClassName = useMemo(() => classnames({
    [`${prefixCls}-content-list-item`]: true,
    [`${prefixCls}-content-list-item-selected`]: mainStore.getSelectedHost?.id === id,
  }), [hostStatus, mainStore.getSelectedHost, id]);

  const deleteRecord = async (): Promise<boolean> => {
    try {
      const res = await HostConfigApis.getDeleteHostUrl(projectId, id);
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  };

  async function handleDelete() {
    const modalProps = {
      key: Modal.key(),
      title: '删除主机',
      children: <DeleteCheck
        formatMessage={formatMessage}
        hostId={id}
        hostName={name}
        projectId={projectId}
        handleDelete={deleteRecord}
      />,
      footer: null,
    };
    Modal.open(modalProps);
  }

  const openConnectModal = useCallback(() => {
    Modal.open({
      key: commandModalKey,
      title: formatMessage({ id: `${intlPrefix}.connect` }),
      children: <HostConnect hostId={id} />,
      style: { width: SMALL },
      drawer: true,
    });
  }, [id]);

  const handleSelect = useCallback(() => {
    if (mainStore.getSelectedHost?.id !== id) {
      loadData({ hostStatus, hostId: id, showPermission });
      mainStore.setSelectedHost(record.toData());
    }
  }, [hostStatus, record, id, mainStore.getSelectedHost, hostStatus]);

  /**
   * 复制按钮
   * @param text
   */
  const handleClickCopy = (text: string) => {
    message.success('复制成功');
  };

  /**
   * 断开连接
   */
  const handleDisConnect = () => {
    Modal.open({
      title: '断开连接',
      children: (
        <div>
          <p>复制以下指令至对应主机执行，来断开连接。</p>
          <TextField
            value={mainStore.getDisConnectCommand}
            disabled
            suffix={(
              <CopyToBoard text={mainStore.getDisConnectCommand} onCopy={handleClickCopy} options={{ format: 'text/plain' }}>
                <Icon style={{ cursor: 'pointer' }} type="content_copy" />
              </CopyToBoard>
            )}
            style={{
              width: '100%',
            }}
          />
        </div>
      ),
      okText: '我知道了',
      okCancel: false,
    });
  };

  const getActionData = useCallback(() => {
    const actionData = [
      {
        service: ['choerodon.code.project.deploy.host.ps.edit'],
        text: formatMessage({ id: 'c7ncd.HostConfig.Modify' }),
        action: () => handleCreateDeployHost(id),
      },
    ];
    if (hostStatus === 'disconnect') {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.connect'],
        text: formatMessage({ id: 'c7ncd.environment.Connect' }),
        action: openConnectModal,
      });
      actionData.push({
        service: ['choerodon.code.project.deploy.host.ps.delete'],
        text: formatMessage({ id: 'c7ncd.resource.Delete' }),
        action: handleDelete,
      });
    } else {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.disconnect'],
        text: formatMessage({ id: 'c7ncd.environment.Disconnect' }),
        action: () => handleDisConnect(),
      });
    }
    return actionData;
  }, [hostStatus, handleDelete, id]);

  return (
    <div className={itemClassName} onClick={handleSelect} role="none">
      <div className={`${prefixCls}-content-list-item-header`}>
        <div className={`${prefixCls}-content-list-item-header-left-top`}>
          <StatusTagOutLine status={hostStatus} />
          <Tooltip title={name} placement="top">
            <span className={`${prefixCls}-content-list-item-header-left-top-name`}>
              {name}
            </span>
          </Tooltip>
        </div>
        <div className={`${prefixCls}-content-list-item-header-right`}>
          {
           record?.get('permissionLabel') === 'administrator'
            && (
              <Action
                data={getActionData()}
                onClick={eventStopProp}
                style={{
                  color: '#5365EA',
                  marginRight: '4px',
                }}
              />
            )
          }
        </div>
      </div>
      <main className={`${prefixCls}-content-list-item-main`}>
        <div className={`${prefixCls}-content-list-item-main-item`}>
          <span>
            {formatMessage({ id: 'c7ncd.environment.Creator' })}
          </span>
          <span>
            <UserInfo
              realName={creatorInfo?.realName}
              loginName={creatorInfo?.ldap ? creatorInfo?.loginName : creatorInfo?.email}
              avatar={creatorInfo?.imageUrl}
            />
          </span>
        </div>
        <div className={`${prefixCls}-content-list-item-main-item`}>
          <span>
            {formatMessage({ id: 'c7ncd.environment.UpdateTime' })}
          </span>
          <span>
            <TimePopover content={lastUpdateDate} />
          </span>
        </div>
      </main>
    </div>
  );
});

export default HostsItem;
