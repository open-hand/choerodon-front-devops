/* eslint-disable max-len */
import React, {
  lazy, Suspense, memo, useEffect, useCallback, useMemo, useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Table, Icon, Tooltip, Modal,
} from 'choerodon-ui/pro';
import { Tabs, Popover } from 'choerodon-ui';
import { map, isEmpty } from 'lodash';
import { Action, useFormatMessage } from '@choerodon/master';
import { StatusTag } from '@choerodon/components';
import ResourceListTitle from '@/routes/resource/main-view/components/resource-list-title';
import { RecordObjectProps, Record } from '@/interface';
import TimePopover from '@/components/timePopover';
import StatusIcon from '@/components/StatusIcon/StatusIcon';
import { LARGE } from '@/utils/getModalWidth';
import ResourceServices from '@/routes/resource/services';
import CreateWorkloadContent from '@/routes/resource/main-view/contents/workload/modals/create-workload';
import DetailsSidebar from '@/routes/resource/main-view/contents/instance/details/sidebar';
import DetailsStore from '@/routes/resource/main-view/contents/instance/stores/DetailsStore';
import { useWorkloadStore } from './stores';
import { useResourceStore } from '../../../stores';
import Modals from './modals';
import PodContent from './components/pod';
import PodDetail from './components/pod-details';

import './index.less';

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
      STATEFULSET_TAB,
      JOB_TAB,
      CRONJOB_TAB,
    },
    workloadStore,
    tableDs,
    urlTypes,
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

  const format = useFormatMessage('c7ncd.resource');

  const podCountName = useMemo(() => ({
    [DEPLOYMENT_TAB]: ['available', 'desired'],
    [DAEMONSET_TAB]: ['numberReady', 'desiredScheduled'],
    [STATEFULSET_TAB]: ['readyReplicas', 'desiredReplicas'],
    [JOB_TAB]: ['active', 'completions'],
    [CRONJOB_TAB]: ['available', 'desired'],
  }), []);
  const [workloadDetail, setWorkloadDetail] = useState<{
    visible: boolean,
    json: string | null,
    yaml: string | null,
  }>({
    visible: false,
    json: null,
    yaml: null,
  });

  const refresh = useCallback(() => {
    tableDs.query();
  }, []);

  const handleTabChange = useCallback((tabKey: string) => {
    workloadStore.setTabKey(tabKey);
    tableDs.queryDataSet?.reset();
  }, []);

  const openDetailModal = useCallback(async (record: Record) => {
    const res = await ResourceServices.getWorkLoadJson(
      projectId,
      parentId,
      workloadStore.getTabKey,
      record.get('name'),
    );
    const yaml = await ResourceServices.getWorkLoadYaml(
      projectId,
      parentId,
      workloadStore.getTabKey,
      record.get('name'),
    );
    setWorkloadDetail({
      visible: true,
      json: res,
      yaml,
    });
  }, [formatMessage, intlPrefix, workloadStore.getTabKey]);

  const handleClose = () => {
    setWorkloadDetail({
      visible: false,
      json: null,
      yaml: null,
    });
  };

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
      children: <PodDetail activeTabkey={workloadStore.getTabKey} podName={podName} envId={parentId} />,
    });
  }, [parentId, workloadStore.getTabKey]);

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
        // @ts-ignore
        urlType={urlTypes[workloadStore.getTabKey] || 'deployments'}
      />,
      okText: formatMessage({ id: 'boot.save' }),
    });
  }, [workloadStore.getTabKey, parentId]);

  const openDeleteModal = useCallback((record: Record) => {
    const modalProps = {
      title: formatMessage({ id: `${intlPrefix}.workload.delete.title` }, { type: workloadStore.getTabKey }),
      children: formatMessage({ id: `${intlPrefix}.workload.delete.des` }, { type: workloadStore.getTabKey, name: record.get('name') }),
      okText: formatMessage({ id: 'delete' }),
    };
    // @ts-ignore
    record.set('urlType', urlTypes[workloadStore.getTabKey] || 'deployments');
    tableDs.delete(record, modalProps);
  }, [workloadStore.getTabKey]);

  const appTypeObj = {
    chart: {
      colorCode: 'operating',
      name: 'Chart资源',
    },
    deploy_group: {
      colorCode: 'success',
      name: '部署组资源',
    },
    workload: {
      colorCode: 'disconnect',
      name: '手动添加',
    },
  };

  const renderAppType = ({ value: sourceType }:{value:'chart'| 'deploy_group'}) => {
    const {
      colorCode,
      name: typeName,
    } = appTypeObj[sourceType || 'chart'] || {};
    return (
      <StatusTag
        style={{
          marginLeft: '4px',
        }}
        colorCode={colorCode as any}
        type="border"
        name={typeName}
      />
    );
  };

  const renderName = useCallback(({ value, record }: { value: string, record: Record }) => {
    const status = record.get('commandStatus');
    const error = record.get('error');
    const sourceType = record.get('sourceType');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
      >
        <StatusIcon
          name={value}
          sourceType={sourceType}
          status={status}
          clickAble={status !== 'operating' && status !== 'failed'}
          onClick={() => openDetailModal(record)}
          permissionCode={['choerodon.code.project.deploy.app-deployment.resource.ps.workload.detail']}
          error={error}
        />
      </div>

    );
  }, []);

  const renderPod = useCallback(({ record }: RecordObjectProps) => {
    const envRecord = treeDs.find((treeRecord: Record) => treeRecord.get('key') === parentId);
    const connect = envRecord && envRecord.get('connect');
    // @ts-ignore
    const [podRunningCountName, podAllCountName] = podCountName[workloadStore.getTabKey] || ['available', 'desired'];
    return (
      <PodContent
        podCount={record.get(podAllCountName) || 0}
        podRunningCount={record.get(podRunningCountName) || 0}
        store={workloadStore}
        projectId={projectId}
        envId={parentId}
        refresh={refresh}
        showBtn={[DEPLOYMENT_TAB, STATEFULSET_TAB].includes(workloadStore.getTabKey)}
        name={record.get('name')}
        btnDisabled={!connect || record.get('commandStatus') !== 'success'}
        kind={workloadStore.getTabKey}
        minPodCount={record.get('instanceId') ? 2 : 1}
      />
    );
  }, [parentId, workloadStore.getTabKey]);

  const renderLabels = useCallback(({ value }: { value: object }) => {
    const labels = map(value || [], (label: string, key: string) => (
      <Tooltip title={`${key}/${label}`} key={key}>
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
      <span className={`${prefixCls}-workload-tag`} key={port}>{port}</span>
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
    if (record.get('commandStatus') === 'operating') {
      return null;
    }
    const actionData = [{
      service: ['choerodon.code.project.deploy.app-deployment.resource.ps.workload.pod'],
      text: format({ id: 'AssociatePodDetails' }),
      action: () => openPodDetailModal(record),
    }];

    if (connect && !record.get('instanceId')) {
      actionData.push({
        service: [`choerodon.code.project.deploy.app-deployment.resource.ps.workload.create.${workloadStore.getTabKey}`],
        text: formatMessage({ id: 'boot.edit' }),
        action: () => openEditModal(record),
      }, {
        service: [`choerodon.code.project.deploy.app-deployment.resource.ps.workload.delete.${workloadStore.getTabKey}`],
        text: formatMessage({ id: 'delete' }),
        action: () => openDeleteModal(record),
      });
    }
    return <Action data={actionData} />;
  }, [parentId, openPodDetailModal, openEditModal, openDeleteModal, workloadStore.getTabKey]);

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
        {map([DEPLOYMENT_TAB, DAEMONSET_TAB, STATEFULSET_TAB, JOB_TAB, CRONJOB_TAB],
          (item: string) => (
            <TabPane
              key={item}
              tab={item}
            />
          ))}
      </Tabs>
      <div className="c7ncd-tab-table">
        {workloadStore.getTabKey === CRONJOB_TAB ? (
          <Table
            dataSet={tableDs}
          >
            <Column name="name" renderer={renderName} />
            <Column renderer={renderAction} width={60} />
            <Column name="sourceType" renderer={renderAppType} />
            <Column name="labels" renderer={renderLabels} />
            <Column name="schedule" />
            <Column name="suspend" renderer={({ value }: { value: boolean }) => (value ? '是' : '否')} width={80} />
            <Column name="active" renderer={({ value }: { value: number }) => (`${value}个`)} width={70} />
            <Column name="source" renderer={renderResource} width={100} />
            <Column name="lastScheduleTime" renderer={renderUpdateDate} width={110} />
            <Column name="creationTimestamp" renderer={renderUpdateDate} width={110} />
          </Table>
        ) : (
          <Table
            dataSet={tableDs}
            rowHeight="auto"
          >
            <Column name="name" renderer={renderName} />
            <Column renderer={renderAction} width={60} />
            <Column name="sourceType" renderer={renderAppType} />
            <Column name="pod" renderer={renderPod} />
            <Column name="labels" renderer={renderLabels} width={130} />
            <Column name="ports" renderer={renderPorts} width={100} />
            <Column name="source" renderer={renderResource} width={100} />
            <Column name="age" renderer={renderUpdateDate} width={110} />
          </Table>
        )}
      </div>
      {workloadDetail.visible && (
      <DetailsSidebar
        visible={workloadDetail.visible}
        json={workloadDetail.json}
        yaml={workloadDetail.yaml}
        formatMessage={formatMessage}
        withoutStore
        onClose={handleClose}
      />
      )}
    </div>
  );
});

export default WorkloadContent;
