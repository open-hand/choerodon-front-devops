import React, { useCallback, useMemo } from 'react';

import { Action } from '@choerodon/boot';
import UserInfo from '@/components/userInfo';
import TimePopover from '@/components/timePopover';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import HostConnect from '@/routes/host-config/components/connect-host';
import { SMALL } from '@/utils/getModalWidth';
import StatusTagOutLine from '../../components/statusTagOutLine';
import eventStopProp from '../../../../../../utils/eventStopProp';
import { useHostConfigStore } from '../../../../stores';
import CreateHost from '../../../create-deploy-host';
import DeleteCheck from '../deleteCheck';
import apis from '../../../../apis';

const commandModalKey = Modal.key();

const HostsItem:React.FC<any> = observer(({
  sshPort, // 主机ssh的端口
  hostStatus, // 主机状态
  hostIp, // 主机ip
  name, // 主机名称
  id, // 主键
  jmeterPort, // jmeter进程的端口号
  jmeterStatus, // jmeter状态
  authType, // 认证类型
  // type, // 主机类型 deploy / distribute_test
  jmeterPath, // jmeter二进制文件的路径
  username, // 用户名
  lastUpdateDate,
  updaterInfo,
  listDs,
  record,
  handleCreateTestHost,
  handleCreateDeployHost,
}) => {
  const {
    prefixCls,
    formatMessage,
    intlPrefix,
    refresh,
    projectId,
    mainStore,
    tabKey: {
      TEST_TAB,
      DEPLOY_TAB,
    },
    mirrorTableDs,
    jarTableDs,
    usageDs,
  } = useHostConfigStore();

  const type = mainStore.getCurrentTabKey; // 主机类型 deploy / distribute_test
  const isDeploy = useMemo(() => (
    mainStore.getCurrentTabKey === DEPLOY_TAB
  ), [mainStore.getCurrentTabKey]);

  const itemClassName = useMemo(() => classnames({
    [`${prefixCls}-content-list-item`]: isDeploy,
    [`${prefixCls}-content-list-item-test`]: !isDeploy,
    [`${prefixCls}-content-list-item-selected`]: isDeploy && mainStore.getSelectedHost?.id === id,
  }), [hostStatus, mainStore.getSelectedHost, isDeploy, id]);

  const getMainStatus = useMemo(() => {
    if (isDeploy) {
      return hostStatus;
    }
    if (type === TEST_TAB) {
      if (jmeterStatus === 'occupied') {
        return 'occupied';
      }
      if (jmeterStatus === 'success' && hostStatus === 'success') {
        return 'success';
      }
      if (jmeterStatus === 'failed' || hostStatus === 'failed') {
        return 'failed';
      }
      return 'operating';
    }
    return 'operating';
  }, [jmeterStatus, hostStatus]);

  const handleCorrect = async ():Promise<void> => {
    try {
      const res = await apis.batchCorrect(projectId, [id], type);
      if (res && res.failed) {
        return;
      }
      refresh();
    } catch (e) {
      throw new Error(e);
    }
  };

  async function deleteRerord():Promise<boolean> {
    try {
      const res = await apis.getDeleteHostUrl(projectId, id, type);
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async function handleDelete() {
    const modalProps = {
      key: Modal.key(),
      children: <DeleteCheck
        formatMessage={formatMessage}
        hostId={id}
        projectId={projectId}
        handleDelete={deleteRerord}
        hostType={type}
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
      okCancel: false,
      okText: formatMessage({ id: 'close' }),
    });
  }, [id]);

  const handleSelect = useCallback(() => {
    if (isDeploy && mainStore.getSelectedHost?.id !== id) {
      if (getMainStatus === 'connected') {
        mirrorTableDs.setQueryParameter('hostId', id);
        jarTableDs.setQueryParameter('hostId', id);
        usageDs.setQueryParameter('hostId', id);
        mirrorTableDs.query();
        jarTableDs.query();
        usageDs.query();
      } else {
        usageDs.removeAll();
        mirrorTableDs.removeAll();
        jarTableDs.removeAll();
      }
      mainStore.setSelectedHost(record.toData());
    }
  }, [isDeploy, hostStatus, record, id, mainStore.getSelectedHost, getMainStatus]);

  const getActionData = useCallback(() => {
    if (isDeploy) {
      const actionData = [
        {
          service: ['choerodon.code.project.deploy.host.ps.edit'],
          text: formatMessage({ id: 'edit' }),
          action: () => handleCreateDeployHost(id),
        },
      ];
      if (getMainStatus === 'disconnect') {
        actionData.unshift({
          service: ['choerodon.code.project.deploy.host.ps.connect'],
          text: formatMessage({ id: `${intlPrefix}.connect` }),
          action: openConnectModal,
        });
        actionData.push({
          service: ['choerodon.code.project.deploy.host.ps.delete'],
          text: formatMessage({ id: 'delete' }),
          action: handleDelete,
        });
      }
      return actionData;
    }
    return (getMainStatus !== 'operating' || getMainStatus !== 'occupied' ? [
      {
        service: ['choerodon.code.project.deploy.host.ps.correct'],
        text: '校准状态',
        action: handleCorrect,
      },
      {
        service: ['choerodon.code.project.deploy.host.ps.edit'],
        text: formatMessage({ id: 'edit' }),
        action: () => handleCreateTestHost(id),
      },
      {
        service: ['choerodon.code.project.deploy.host.ps.delete'],
        text: formatMessage({ id: 'delete' }),
        action: handleDelete,
      },
    ] : []);
  }, [getMainStatus, handleCorrect, handleDelete, isDeploy, id]);

  return (
    <div className={itemClassName} onClick={handleSelect} role="none">
      <div className={`${prefixCls}-content-list-item-header`}>
        <div className={`${prefixCls}-content-list-item-header-left`}>
          <div className={`${prefixCls}-content-list-item-header-left-top`}>
            <StatusTagOutLine status={getMainStatus} />
            <Tooltip title={name} placement="top">
              <span className={`${prefixCls}-content-list-item-header-left-top-name`}>
                {name}
              </span>
            </Tooltip>
          </div>
          <div className={`${prefixCls}-content-list-item-header-left-bottom`}>
            <div>
              <UserInfo
                name={updaterInfo?.ldap ? `${updaterInfo?.realName}(${updaterInfo?.loginName})` : `${updaterInfo?.loginName}(${updaterInfo?.email})`}
                showName={false}
                avatar={updaterInfo?.imageUrl}
              />
            </div>
            <div>
              <span>更新于</span>
              <TimePopover
                style={{
                  marginLeft: '4px',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-color4)',
                }}
                content={lastUpdateDate}
              />
            </div>
          </div>
        </div>
        {getMainStatus !== 'operating' && getMainStatus !== 'occupied' && (
          <div className={`${prefixCls}-content-list-item-header-right`}>
            <Action
              data={getActionData()}
              onClick={eventStopProp}
              style={{
                color: '#5365EA',
                marginRight: '4px',
              }}
            />
          </div>
        )}
      </div>
      <main className={`${prefixCls}-content-list-item-main`}>
        <div className={`${prefixCls}-content-list-item-main-item`}>
          <span>
            IP与端口
          </span>
          <span>
            {hostIp && sshPort ? `${hostIp}：${sshPort}` : '-'}
          </span>
        </div>
        {
          type === 'distribute_test' && (
            <>
              <div className={`${prefixCls}-content-list-item-main-item`}>
                <span>
                  Jmeter端口
                </span>
                <span>
                  {jmeterPort}
                </span>
              </div>
              <div className={`${prefixCls}-content-list-item-main-item`}>
                <span>
                  Jmeter路径
                </span>
                <span>
                  {jmeterPath}
                </span>
              </div>
            </>
          )
        }
      </main>
    </div>
  );
});

export default HostsItem;
