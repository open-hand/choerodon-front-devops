import React, {
  lazy, Suspense, memo, useEffect, useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Icon, Tooltip } from 'choerodon-ui/pro';
import { Tabs, Popover } from 'choerodon-ui';
import { map, isEmpty } from 'lodash';
import { Action } from '@choerodon/master';
import ResourceListTitle from '@/routes/resource/main-view/components/resource-list-title';
import { RecordObjectProps, Record } from '@/interface';
import TimePopover from '@/components/timePopover';
import StatusIcon from '@/components/StatusIcon/StatusIcon';
import { useWorkloadStore } from './stores';
import { useResourceStore } from '../../../stores';
import Modals from './modals';

import './index.less';

const { TabPane } = Tabs;
const { Column } = Table;

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
  } = useWorkloadStore();
  const {
    prefixCls,
    intlPrefix,
    resourceStore,
    treeDs,
    intl: { formatMessage },
  } = useResourceStore();
  const { getSelectedMenu: { key: selectedKey } } = resourceStore;

  const handleTabChange = useCallback((tabKey: string) => {
    workloadStore.setTabKey(tabKey);
  }, []);

  const openDetailModal = useCallback(() => {

  }, []);

  const openPodDetailModal = useCallback(() => {

  }, []);

  const openEditModal = useCallback(() => {

  }, []);

  const openDeleteModal = useCallback(() => {

  }, []);

  const renderName = useCallback(({ value, record }: { value: string, record: Record }) => {
    const status = record.get('status');
    const error = record.get('errorMessage');
    return (
      <StatusIcon
        name={value}
        status={status}
        clickAble
        onClick={openDetailModal}
        permissionCode={[]}
        error={error}
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
    if (record.get('status') === 'operating') {
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
        <Table dataSet={tableDs}>
          <Column name="name" renderer={renderName} />
          <Column renderer={renderAction} width={60} />
          <Column name="pod" />
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
