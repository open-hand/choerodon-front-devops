import React, { useCallback, useMemo } from 'react';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import {
  Progress, Tabs, Table, Modal, Tooltip, Icon,
} from 'choerodon-ui/pro';
import { Action } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { Size, TableQueryBarType, TableColumnTooltip } from '@/interface';
import { useHostConfigStore } from '@/routes/host-config/stores';
import {
  StatusTag, TimePopover, UserInfo, EmptyPage,
} from '@choerodon/components';
// @ts-ignore
import EmptySvg from '@/routes/host-config/images/empty-page.svg';
import HostConfigServices from '@/routes/host-config/services';

import './index.less';

const { TabPane } = Tabs;
const { Column } = Table;
const stopModalKey = Modal.key();

const ResourceContent = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    prefixCls,
    projectId,
    mainStore,
    mirrorTableDs,
    jarTableDs,
    usageDs,
  } = useHostConfigStore();

  const usageRecord = useMemo(() => usageDs.current, [usageDs.current]);

  const usageData = useMemo(() => ({
    cpu: {
      title: formatMessage({ id: `${intlPrefix}.usage.cpu` }),
      field: 'cpu',
      value: Number(usageRecord?.get('cpu') || 0),
    },
    root: {
      title: formatMessage({ id: `${intlPrefix}.usage.root` }),
      field: 'root',
      value: Number(usageRecord?.get('disk') || 0),
    },
    ram: {
      title: formatMessage({ id: `${intlPrefix}.usage.ram` }),
      field: 'root',
      value: Number(usageRecord?.get('mem') || 0),
    },
  }), [usageRecord, mainStore.getSelectedHost]);

  const refreshDocker = useCallback(() => {
    mirrorTableDs.query();
  }, []);

  const refreshJar = useCallback(() => {
    jarTableDs.query();
  }, []);

  const openStopModal = useCallback(({ record: tableRecord }) => {
    Modal.open({
      key: stopModalKey,
      title: '停止镜像',
      children: `确定要停止镜像“${tableRecord.get('name')}”吗？`,
      okText: '停止',
      onOk: () => handleStop({ record: tableRecord }),
    });
  }, []);

  const handleStop = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.stopDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refreshDocker();
    }
    return res;
  }, []);

  const handleRestart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.restartDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refreshDocker();
    }
    return res;
  }, []);

  const handleStart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.startDocker(projectId, tableRecord.get('hostId'), tableRecord.get('id'));
    if (res) {
      refreshDocker();
    }
    return res;
  }, []);

  const handleDelete = useCallback(({ record: tableRecord }) => {
    const modalProps = {
      title: '删除镜像',
      children: `确定删除镜像“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    mirrorTableDs.delete(tableRecord, modalProps);
  }, []);

  const handleJarDelete = useCallback(({ record: tableRecord }) => {
    const modalProps = {
      title: '删除jar包',
      children: `确定删除jar包“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    jarTableDs.delete(tableRecord, modalProps);
  }, []);

  const renderAction = useCallback(({ record: tableRecord }) => {
    if (!['running', 'exited'].includes(tableRecord.get('status'))) {
      return null;
    }
    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.docker.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    }];
    if (tableRecord.get('status') === 'running') {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.docker.stop'],
        text: '停止',
        action: () => openStopModal({ record: tableRecord }),
      }, {
        service: ['choerodon.code.project.deploy.host.ps.docker.restart'],
        text: '重启',
        action: () => handleRestart({ record: tableRecord }),
      });
    } else {
      actionData.unshift({
        service: ['choerodon.code.project.deploy.host.ps.docker.start'],
        text: '启动',
        action: () => handleStart({ record: tableRecord }),
      });
    }
    return <Action data={actionData} />;
  }, []);

  const renderJarAction = useCallback(({ record: tableRecord }) => {
    const actionData = [{
      service: ['choerodon.code.project.deploy.host.ps.jar.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleJarDelete({ record: tableRecord }),
    }];
    return <Action data={actionData} />;
  }, []);

  const renderPort = useCallback(({ value }) => {
    const portContent = map(value || [], (item) => {
      const { containerPort, hostIP, hostPort } = item || {};
      return <div>{`${hostIP}:${hostPort}:${containerPort}`}</div>;
    });
    if (!isEmpty(portContent)) {
      return (
        <div className={`${prefixCls}-resource-port`}>
          {portContent[0]}
          {portContent.length > 1 && (
            <Tooltip
              theme="light"
              title={portContent}
            >
              <Icon type="expand_more" />
            </Tooltip>
          )}
        </div>
      );
    }
    return null;
  }, []);

  const renderStatus = useCallback(({ value }) => {
    const color = {
      running: '#1fc2bb',
      exited: '#faad14',
    };
    if (['running', 'exited'].includes(value)) {
      return (
        <StatusTag
          type="default"
          name={value?.toUpperCase()}
          // @ts-ignore
          color={color[value] || '#1fc2bb'}
        />
      );
    }
    return null;
  }, []);

  const renderUser = useCallback(({ value }) => {
    const {
      ldap, loginName, realName, email, imageUrl,
    } = value || {};
    return (
      <UserInfo
        realName={realName}
        loginName={ldap ? loginName : email}
        avatar={imageUrl}
      />
    );
  }, []);

  const renderDate = useCallback(({ value }) => <TimePopover content={value} />, []);

  const getContent = useCallback(() => {
    if (mainStore.getSelectedHost?.hostStatus === 'connected') {
      return (
        <div className={`${prefixCls}-resource-tab`}>
          <Tabs defaultActiveKey="mirroring">
            <TabPane tab="镜像" key="mirroring">
              <Table
                dataSet={mirrorTableDs}
                queryBar={'none' as TableQueryBarType}
                className="c7ncd-tab-table"
              >
                <Column name="name" tooltip={'overflow' as TableColumnTooltip} />
                <Column renderer={renderAction} width={60} />
                <Column name="status" renderer={renderStatus} width={100} />
                <Column name="portMappingList" renderer={renderPort} />
                <Column name="deployer" renderer={renderUser} />
                <Column name="creationDate" renderer={renderDate} width={105} />
              </Table>
            </TabPane>
            <TabPane tab="jar包" key="jar">
              <Table
                dataSet={jarTableDs}
                queryBar={'none' as TableQueryBarType}
                className="c7ncd-tab-table"
              >
                <Column name="name" tooltip={'overflow' as TableColumnTooltip} />
                <Column renderer={renderJarAction} width={60} />
                <Column name="pid" />
                <Column name="port" />
                <Column name="deployer" renderer={renderUser} />
                <Column name="creationDate" renderer={renderDate} />
              </Table>
            </TabPane>
          </Tabs>
        </div>
      );
    }
    return <EmptyPage image={EmptySvg} description="暂未获取到该主机资源信息" />;
  }, [mainStore.getSelectedHost]);

  return (
    <div className={`${prefixCls}-resource`}>
      <span className={`${prefixCls}-resource-title`}>
        {mainStore.getSelectedHost?.name}
      </span>
      <div className={`${prefixCls}-resource-usage`}>
        {map(usageData, ({ title, value }) => (
          <div className={`${prefixCls}-resource-usage-item`}>
            <span className={`${prefixCls}-resource-usage-label`}>
              {title}
              ：
            </span>
            {mainStore.getSelectedHost?.hostStatus === 'connected' ? (
              <Progress value={value} size={'small' as Size} />
            ) : '-'}
          </div>
        ))}
      </div>
      {getContent()}
    </div>
  );
});

export default ResourceContent;
