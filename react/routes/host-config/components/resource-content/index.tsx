import React, { useCallback, useMemo } from 'react';
import map from 'lodash/map';
import {
  Progress, Tabs, Table, Modal,
} from 'choerodon-ui/pro';
import { Action } from '@choerodon/master';
import { observer } from 'mobx-react-lite';
import { Size, TableQueryBarType } from '@/interface';
import { useHostConfigStore } from '@/routes/host-config/stores';
import { StatusTag } from "@choerodon/components";

import './index.less';

const { TabPane } = Tabs;
const { Column } = Table;
const stopModalKey = Modal.key();

const ResourceContent = observer(() => {
  const {
    intlPrefix,
    formatMessage,
    prefixCls,
    mainStore,
    mirrorTableDs,
    jarTableDs,
  } = useHostConfigStore();

  const usageData = useMemo(() => ({
    cpu: {
      title: formatMessage({ id: `${intlPrefix}.usage.cpu` }),
      field: 'cpu',
      value: 23,
    },
    root: {
      title: formatMessage({ id: `${intlPrefix}.usage.root` }),
      field: 'root',
      value: 12,
    },
    ram: {
      title: formatMessage({ id: `${intlPrefix}.usage.ram` }),
      field: 'root',
      value: 75,
    },
    data: {
      title: formatMessage({ id: `${intlPrefix}.usage.data` }),
      field: 'root',
      value: 50,
    },
  }), []);

  const openStopModal = useCallback(({ record: tableRecord }) => {
    Modal.open({
      key: stopModalKey,
      title: '停止镜像',
      children: `确定要停止镜像“${tableRecord.get('name')}”吗？`,
      okText: '停止',
      onOk: handleStop,
    });
  }, []);

  const handleStop = useCallback(() => {

  }, []);

  const handleReboot = useCallback(() => {

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
    const actionData = [{
      service: [],
      text: '停止',
      action: openStopModal,
    }, {
      service: [],
      text: '重启',
      action: handleReboot,
    }, {
      service: [],
      text: formatMessage({ id: 'delete' }),
      action: () => handleDelete({ record: tableRecord }),
    }];
    return <Action data={actionData} />;
  }, []);

  const renderJarAction = useCallback(({ record: tableRecord }) => {
    const actionData = [{
      service: [],
      text: formatMessage({ id: 'delete' }),
      action: () => handleJarDelete({ record: tableRecord }),
    }];
    return <Action data={actionData} />;
  }, []);

  const renderStatus = useCallback(({ value }) => (
    <StatusTag
      type="default"
      name={value}
      color={value === 'RUNNING' ? '#1fc2bb' : '#faad4'}
    />
  ), []);

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
            <Progress value={value} size={'small' as Size} />
          </div>
        ))}
      </div>
      <div className={`${prefixCls}-resource-tab`}>
        <Tabs defaultActiveKey="mirroring">
          <TabPane tab="镜像" key="mirroring">
            <Table
              dataSet={mirrorTableDs}
              queryBar={'none' as TableQueryBarType}
              className="c7ncd-tab-table"
            >
              <Column name="name" />
              <Column renderer={renderAction} />
              <Column name="status" renderer={renderStatus} />
              <Column name="port" />
              <Column name="deployer" />
              <Column name="deployDate" />
            </Table>
          </TabPane>
          <TabPane tab="jar包" key="jar">
            <Table
              dataSet={jarTableDs}
              queryBar={'none' as TableQueryBarType}
              className="c7ncd-tab-table"
            >
              <Column name="name" />
              <Column renderer={renderJarAction} />
              <Column name="process" />
              <Column name="port" />
              <Column name="deployer" />
              <Column name="deployDate" />
            </Table>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
});

export default ResourceContent;
