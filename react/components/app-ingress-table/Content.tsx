/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Action } from '@choerodon/master';
import { Modal, Table, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { StatusTag, TimePopover, UserInfo } from '@choerodon/components';
import { MIDDLE } from '@/utils/getModalWidth';
import { TableQueryBarType } from '@/interface';
import { getAppCategories } from '@/routes/app-center-pro/utils';
import { getReady } from '@/routes/app-center-pro/routes/app-detail/components/host-detail';
import { useAppIngressTableStore } from './stores';
import HostConfigServices from './services';
import {
  DOCKER_TYPE,
  OTHER_TYPE,
  JAR_TYPE,
  SUCCESS_HOST_STATUS,
  FAILED_HOST_STATUS,
  OPERATING_HOST_STATUS,
  RUNNING_DOCKER,
  CREATED_DOCKER,
  EXITED_DOCKER,
} from '@/components/app-ingress-table/CONSTANT';
// import ConfigurationModal from '@/components/configuration-center/ConfigurationModal';

import './index.less';

const { Column } = Table;
// const ConfigurationModalKey = Modal.key();

const AppIngress = observer(() => {
  const {
    prefixCls,
    appIngressDataset,
    intl: { formatMessage },
    projectId,
    // configurationDetailDataSet,
  } = useAppIngressTableStore();

  function refresh() {
    appIngressDataset.query();
  }

  const openStopModal = useCallback(({ record: tableRecord }) => {
    Modal.open({
      key: Modal.key(),
      title: '停止应用实例',
      children: `确定要停止应用实例“${tableRecord.get('name')}”吗？`,
      okText: '停止',
      onOk: () => handleStop({ record: tableRecord }),
    });
  }, []);

  // 停止
  const handleStop = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.stopDocker(projectId, tableRecord.get('hostId'), tableRecord.get('instanceId'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  // 重启
  const handleRestart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.restartDocker(projectId, tableRecord.get('hostId'), tableRecord.get('instanceId'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  const handleStart = useCallback(async ({ record: tableRecord }) => {
    const res = await HostConfigServices.startDocker(projectId, tableRecord.get('hostId'), tableRecord.get('instanceId'));
    if (res) {
      refresh();
    }
    return res;
  }, []);

  const handleDelete = useCallback(async ({ record: tableRecord }) => {
    const modalProps = {
      title: '删除应用实例',
      children: `确定删除应用实例“${tableRecord.get('name')}”吗？`,
      okText: formatMessage({ id: 'delete' }),
    };
    try {
      const res = await appIngressDataset.delete(tableRecord, modalProps);
      if (res && res.failed) {
        message.error(res?.message);
      }
      refresh();
    } catch (error) {
      throw new Error(error);
    }
  }, [appIngressDataset, refresh]);

  //   const handleOpenConfigurationModal = ({ record: tableRecord }) => {
  //     const { instanceId } = tableRecord.toData();
  //     Modal.open({
  //       key: ConfigurationModalKey,
  //       title: '配置文件详情',
  //       style: { width: MIDDLE },
  //       children: <ConfigurationModal type="modal" configurationDetailDataSet={configurationDetailDataSet} id={instanceId} kind="host" />,
  //       okText: formatMessage({ id: 'close' }),
  //       okCancel: false,
  //       drawer: true,
  //     });
  //   };

  const renderAction = useCallback(({ record: tableRecord }) => {
    const devopsHostCommandDTO = tableRecord.get('devopsHostCommandDTO');
    const rdupmType = tableRecord?.get('rdupmType');
    const status = devopsHostCommandDTO?.status;
    const dockerStatus = tableRecord?.get('status');
    let actionData = [];
    const deleteObj = {
      service: ['choerodon.code.project.deploy.host.ps.docker.delete'],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    };
    const stopObj = {
      service: ['choerodon.code.project.deploy.host.ps.docker.stop'],
      text: '停止',
      action: () => openStopModal({ record: tableRecord }),
    };
    const restartObj = {
      service: ['choerodon.code.project.deploy.host.ps.docker.restart'],
      text: '重启',
      action: () => handleRestart({ record: tableRecord }),
    };
    const startObj = {
      service: ['choerodon.code.project.deploy.host.ps.docker.start'],
      text: '启动',
      action: () => handleStart({ record: tableRecord }),
    };
    switch (rdupmType) {
      case JAR_TYPE:
      case OTHER_TYPE: {
        if ([SUCCESS_HOST_STATUS, FAILED_HOST_STATUS].includes(status)) {
          actionData.push(deleteObj);
        } break;
      }
      case DOCKER_TYPE: {
        if ([SUCCESS_HOST_STATUS, FAILED_HOST_STATUS].includes(status)) {
          if (dockerStatus === RUNNING_DOCKER) {
            actionData = [restartObj, stopObj, deleteObj];
          } else if (dockerStatus === CREATED_DOCKER) {
            actionData = [restartObj, startObj, deleteObj];
          } else if (dockerStatus === EXITED_DOCKER) {
            actionData = [startObj, deleteObj];
          } else {
            actionData = [deleteObj];
          }
        }
        break;
      }
      default: {
        break;
      }
    }
    // const operateStatus = devopsHostCommandDTO?.status;
    //
    // if (operateStatus === 'operating') {
    //   return null;
    // }
    //
    // const status = tableRecord.get('status');
    // // console.log(status);
    //
    // const actionData = [
    // //   {
    // //     text: '查看配置文件',
    // //     action: () => handleOpenConfigurationModal({ record: tableRecord }),
    // //   },
    // ];
    //
    // if (!status || (['normal_process', 'java_process'].includes(tableRecord.get('instanceType')))) {
    //   return <Action data={actionData} />;
    // }
    //
    // if (!['running', 'exited', 'removed'].includes(status)) {
    //   return null;
    // }

    // switch (status) {
    //   case 'running':
    //     actionData.unshift({
    //       service: ['choerodon.code.project.deploy.host.ps.docker.stop'],
    //       text: '停止',
    //       action: () => openStopModal({ record: tableRecord }),
    //     },
    //     {
    //       service: ['choerodon.code.project.deploy.host.ps.docker.restart'],
    //       text: '重启',
    //       action: () => handleRestart({ record: tableRecord }),
    //     });
    //     break;
    //   case 'removed':
    //     break;
    //   default:
    //     actionData.unshift({
    //       service: ['choerodon.code.project.deploy.host.ps.docker.start'],
    //       text: '启动',
    //       action: () => handleStart({ record: tableRecord }),
    //     });
    //     break;
    // }
    return <Action data={actionData} />;
  }, [handleDelete, handleRestart, handleStart, openStopModal]);

  const renderName = ({ record, text }: any) => {
    const devopsHostCommandDTO = record.get('devopsHostCommandDTO');
    const operateStatus = devopsHostCommandDTO?.status;
    const error = devopsHostCommandDTO?.error;
    const commandType = devopsHostCommandDTO?.commandType;
    return (
      <>
        <Tooltip
          title={error ? `[${commandType}]:${error}` : ''}
        >
          <span className={`${prefixCls}-name`}>
            {text}
          </span>
        </Tooltip>
        {operateStatus && !(operateStatus === 'success') && (
          <StatusTag
            style={{
              marginLeft: '5px',
            }}
            ellipsisTitle={error}
            colorCode={operateStatus}
            name={operateStatus === 'operating' ? '执行中' : '失败'}
          />
        )}
      </>
    );
  };

  const renderStatus = ({ text, record }: any) => {
    if (record?.get('rdupmType') === DOCKER_TYPE) {
      return record?.get('status') || '-';
    }
    return (
      <Tag
        color={getReady(record?.get('ready'), record, 'color')}
      >
        {getReady(record?.get('ready'), record, 'text')}
      </Tag>
    );
  };

  const renderUser = ({ value }: any) => {
    if (!value) {
      return null;
    }
    const {
      ldap,
      realName,
      loginName,
      imageUrl,
      email,
    } = value || {};
    return <UserInfo realName={realName} loginName={ldap ? loginName : email} avatar={imageUrl} />;
  };

  // 主机管理应用实例
  return (
    <Table
      dataSet={appIngressDataset}
      border={false}
      queryBar={'bar' as TableQueryBarType}
      className="c7ncd-tab-table"
    >
      <Column header={formatMessage({ id: 'c7ncd.environment.Name' })} name="name" renderer={renderName} />
      <Column renderer={renderAction} width={55} />
      <Column header={formatMessage({ id: 'c7ncd.environment.ApplicationCode' })} name="code" width={90} />
      <Column
        header={formatMessage({ id: 'c7ncd.environment.rdupm' })}
        name="rdupmType"
        width={90}
        renderer={({ value, record }) => getAppCategories(record?.get('rdupmType'), 'host')?.name}
      />
      <Column
        header={formatMessage({ id: 'c7ncd.environment.Status' })}
        name="status"
        renderer={renderStatus}
      />
      {/* <Column header={formatMessage({ id: 'c7ncd.environment.ProcessID' })} name="pid" width={80} /> */}
      {/* <Column header={formatMessage({ id: 'c7ncd.environment.OccupiedPort' })} name="ports" width={100} renderer={({ value }) => <Tooltip title={value}>{value}</Tooltip>} /> */}
      <Column header={formatMessage({ id: 'c7ncd.environment.Creator' })} name="creator" renderer={renderUser} />
      <Column header={formatMessage({ id: 'c7ncd.environment.CreationTime' })} name="creationDate" renderer={({ text }) => <TimePopover content={text} />} />
    </Table>
  );
});

export default AppIngress;
