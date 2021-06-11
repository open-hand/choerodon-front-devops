import React, {
  lazy, Suspense, memo, useEffect, useCallback, useMemo,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Table, Icon, Tooltip, Modal,
} from 'choerodon-ui/pro';
import { Tabs, Popover } from 'choerodon-ui';
import { map, isEmpty } from 'lodash';
import { Action } from '@choerodon/master';
import ResourceListTitle from '@/routes/resource/main-view/components/resource-list-title';
import { RecordObjectProps, Record } from '@/interface';
import TimePopover from '@/components/timePopover';
import StatusIcon from '@/components/StatusIcon/StatusIcon';
import { LARGE } from '@/utils/getModalWidth';
import CreateWorkloadContent from '@/routes/resource/main-view/contents/workload/modals/create-workload';
import { useWorkloadStore } from './stores';
import { useResourceStore } from '../../../stores';
import Modals from './modals';
import PodContent from './components/pod';

import './index.less';
import PodDetail from './components/pod-details';

const { TabPane } = Tabs;
const { Column } = Table;

const editModalKey = Modal.key();
const detailModalKey = Modal.key();
const podDetailModalKey = Modal.key();

const WorkloadContent = observer(() => {
  const {
    tabs: {
      DAEMONSET_TAB,
      DEPLOYMENT_TAB,
      STATEFULSET,
      JOB_TAB,
      CRONJOB_TAB,
    },
    workloadStore,
    tableDs,
    envId,
  } = useWorkloadStore();

  const {
    prefixCls,
    intlPrefix,
    resourceStore,
    treeDs,
    intl: { formatMessage },
    AppState: { currentMenuType: { projectId } },
  } = useResourceStore();
  const { getSelectedMenu: { parentId } } = resourceStore;

  const refresh = useCallback(() => {
    tableDs.query();
  }, []);

  const handleTabChange = useCallback((tabKey: string) => {
    workloadStore.setTabKey(tabKey);
  }, []);

  const openDetailModal = useCallback((record: Record) => {
    Modal.open({
      key: detailModalKey,
      style: {
        width: LARGE,
      },
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.workload.detail` }, { type: workloadStore.getTabKey, name: record.get('name') }),
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
    });
  }, [formatMessage, intlPrefix, workloadStore.getTabKey]);

  const openPodDetailModal = useCallback((record: Record) => {
    const podName = record.get('name');
    Modal.open({
      key: podDetailModalKey,
      style: {
        width: LARGE,
      },
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.workload.pod.detail` }),
      okText: formatMessage({ id: 'close' }),
      okCancel: false,
      children: <PodDetail podName={podName} envId={envId} />,
    });
  }, [envId, formatMessage, intlPrefix]);

  const openEditModal = useCallback((record: Record) => {
    const envRecord = treeDs.find((treeRecord: Record) => treeRecord.get('key') === parentId);
    const envName = envRecord && envRecord.get('name');
    Modal.open({
      key: editModalKey,
      style: {
        width: LARGE,
      },
      drawer: true,
      title: formatMessage({ id: `${intlPrefix}.workload.edit` }, { name: workloadStore.getTabKey }),
      children: <CreateWorkloadContent
        resourceStore={resourceStore}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={refresh}
        envName={envName}
        workloadId={record.get('id')}
        workloadType={workloadStore.getTabKey}
      />,
      okText: formatMessage({ id: 'save' }),
    });
  }, [workloadStore.getTabKey]);

  const openDeleteModal = useCallback((record: Record) => {
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.workload.delete.title` }, { type: workloadStore.getTabKey }),
      children: formatMessage({ id: `${intlPrefix}.workload.delete.des` }, { type: workloadStore.getTabKey, name: record.get('name') }),
      okText: formatMessage({ id: 'delete' }),
      okProps: { color: 'red' },
      cancelProps: { color: 'dark' },
    };
    tableDs.delete(record, modalProps);
  }, [workloadStore.getTabKey]);

  const renderName = useCallback(({ value, record }: { value: string, record: Record }) => {
    const status = record.get('commandStatus');
    const error = record.get('error');
    return (
      <StatusIcon
        name={value}
        status={status}
        clickAble={status !== 'operating'}
        onClick={() => openDetailModal(record)}
        permissionCode={[]}
        error={error}
      />
    );
  }, []);

  const renderPod = useCallback(({ record }: RecordObjectProps) => {
    const envRecord = treeDs.find((treeRecord: Record) => treeRecord.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    return (
      <PodContent
        podCount={record.get('desired')}
        podRunningCount={record.get('available')}
        store={workloadStore}
        projectId={projectId}
        envId={parentId}
        refresh={refresh}
        showBtn={['Deployment', 'StatefulSet'].includes(workloadStore.getTabKey)}
        btnDisabled={!connect || record.get('commandStatus') === 'operating'}
      />
    );
  }, []);

  const renderLabels = useCallback(({ value }: { value: object }) => {
    const labels = map(value || [], (label: string, key: string) => (
      <Tooltip title={`${key}/${label}`}>
        <span className={`${prefixCls}-workload-tag`}>
          {key}
          /
          {label}
        </span>
      </Tooltip>
    ));
    if (isEmpty(labels)) {
      return null;
    }
    return (
      <>
        {labels[0]}
        {labels.length > 1 && (
          <Popover content={labels} placement="bottom">
            <Icon type="expand_more" />
          </Popover>
        )}
      </>
    );
  }, []);

  const renderPorts = useCallback(({ value }: { value: Array<number | string> }) => {
    const ports = map(value || [], (port: number | string) => (
      <span className={`${prefixCls}-workload-tag`}>{port}</span>
    ));
    if (isEmpty(ports)) {
      return null;
    }
    return (
      <>
        {ports[0]}
        {ports.length > 1 && (
          <Popover content={ports} placement="bottom">
            <Icon type="expand_more" />
          </Popover>
        )}
      </>
    );
  }, []);

  const renderResource = useCallback(({ record }: RecordObjectProps) => (
    formatMessage({ id: `${intlPrefix}.workload.source.${record.get('instanceId') ? 'deploy' : 'manual'}` })
  ), []);

  const renderUpdateDate = useCallback(({ value }: { value: string }) => (
    <TimePopover content={value} />
  ), []);

  const renderAction = useCallback(({ record }: RecordObjectProps) => {
    const envRecord = treeDs.find((treeRecord: Record) => treeRecord.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    if (!connect || record.get('instanceId') || record.get('commandStatus') === 'operating') {
      return null;
    }
    const actionData = [
      {
        service: [],
        text: formatMessage({ id: `${intlPrefix}.workload.pod.detail` }),
        action: () => openPodDetailModal(record),
      }, {
        service: [],
        text: formatMessage({ id: 'edit' }),
        action: () => openEditModal(record),
      }, {
        service: [],
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(record),
      },
    ];
    return <Action data={actionData} />;
  }, []);

  return (
    <div className={`${prefixCls}-workload`}>
      <Modals />
      <ResourceListTitle type="workload" />
      <Tabs
        className={`${prefixCls}-workload-tabs`}
        animated={false}
        activeKey={workloadStore.getTabKey}
        onChange={handleTabChange}
      >
        {map([DEPLOYMENT_TAB, DAEMONSET_TAB, STATEFULSET, JOB_TAB, CRONJOB_TAB], (item: string) => (
          <TabPane
            key={item}
            tab={item}
          />
        ))}
      </Tabs>
      <div className="c7ncd-tab-table">
        <Table
          dataSet={tableDs}
          rowHeight="auto"
        >
          <Column name="name" renderer={renderName} />
          <Column renderer={renderAction} width={60} />
          <Column name="pod" renderer={renderPod} />
          <Column name="labels" renderer={renderLabels} />
          <Column name="ports" renderer={renderPorts} />
          <Column name="source" renderer={renderResource} width={100} />
          <Column name="age" renderer={renderUpdateDate} width={110} />
        </Table>
      </div>
    </div>
  );
});

export default WorkloadContent;
