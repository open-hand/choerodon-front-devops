/* eslint-disable max-len */
import React, { useEffect } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import PageTitle from '@/components/page-title';
import EnvItem from '@/components/env-item';
import HeaderButtons from './components/HeaderButtons';
import ItemNumberByStatus from './components/ItemNumberByStatus';
import { useResourceStore } from '../../../stores';
import { useREStore } from './stores';
import { instanceMappingsType } from './interface';
import EnvironmentTabs from './components/EnvTabs';

import './index.less';
import openWarnModal from '@/utils/openWarnModal';
import ItemNumberByResource from './components/ItemNumberByResource';

const Content = observer(() => {
  const statusCount = ['runningInstanceCount', 'operatingInstanceCount', 'stoppedInstanceCount', 'failedInstanceCount'];

  const resourceCount:instanceMappingsType[] = [
    'instanceCount',
    'workloadCount',
    'podCount',
    'serviceCount',
    'ingressCount',
    'certificationCount',
    'configMapCount',
    'secretCount',
  ];

  const {
    prefixCls,
    intlPrefix,
    intl: { formatMessage },
    treeDs,
    resourceStore,
  } = useResourceStore();

  const {
    baseInfoDs,
    resourceCountDs,
  } = useREStore();

  function getCounts(type?:string) {
    const record = resourceCountDs.current;

    if (type === 'status') {
      return statusCount.map((item) => {
        const count = record ? record.get(item) : 0;
        const name = formatMessage({ id: `${intlPrefix}.status.${item}` });
        return (
          <ItemNumberByStatus
            key={item}
            code={item}
            name={name}
            count={count}
            prefixCls={prefixCls}
          />
        );
      });
    }
    return resourceCount.map((item:instanceMappingsType) => {
      const count = record ? record.get(item) : 0;
      const name = formatMessage({ id: `${intlPrefix}.resource.${item}` });
      return (
        <ItemNumberByResource
          key={item}
          code={item}
          name={name}
          count={count}
          prefixCls={prefixCls}
        />
      );
    });
  }

  function refresh() {
    treeDs.query();
  }

  function getCurrent() {
    const record = baseInfoDs.current;
    if (record) {
      const id = record.get('id');
      const name = record.get('name');
      const active = record.get('active');
      const connect = record.get('connect');
      return {
        id, name, active, connect,
      };
    }
    return null;
  }

  useEffect(() => {
    const currentBase = getCurrent();
    if (currentBase) {
      const {
        id, name, active, connect,
      } = currentBase;
      const menuItem = treeDs.find((item:any) => item.get('key') === String(id));
      if (menuItem) {
        // 清除已经停用的环境
        if (!active) {
          openWarnModal(refresh);
        } else if ((menuItem.get('connect') !== connect
          || menuItem.get('name') !== name)) {
          runInAction(() => {
            menuItem.set({ name, connect });
            resourceStore.setSelectedMenu({
              ...resourceStore.getSelectedMenu,
              name,
              connect,
            });
          });
        }
      }
    }
  }, [baseInfoDs.current]);

  function getTitle() {
    const record = baseInfoDs.current;
    if (record) {
      const name = record.get('name');
      const connect = record.get('connect');
      const clusterName = record.get('clusterName');
      // @ts-expect-error
      return <EnvItem isTitle connect={connect} name={name} formatMessage={formatMessage} clusterName={clusterName} />;
    }
    return null;
  }

  function getFallBack() {
    const {
      name,
      connect,
    } = resourceStore.getSelectedMenu;
    // @ts-expect-error
    return <EnvItem isTitle name={name} connect={connect} />;
  }

  return (
    <div className={`${prefixCls}-re`}>
      <HeaderButtons />
      <PageTitle content={getTitle()} fallback={getFallBack()} />
      <Spin spinning={resourceCountDs.status === 'loading'}>
        <div className={`${prefixCls}-re-card-wrap`}>
          <div className={`${prefixCls}-re-card ${prefixCls}-re-card_left`}>
            <div className={`${prefixCls}-re-card-title`}>{formatMessage({ id: `${intlPrefix}.resource.deploy` })}</div>
            <div className={`${prefixCls}-re-grid-left`}>
              {getCounts()}
            </div>
          </div>
          <div className={`${prefixCls}-re-card ${prefixCls}-re-card_right`}>
            <div className={`${prefixCls}-re-card-title`}>{formatMessage({ id: `${intlPrefix}.instance.status` })}</div>
            <div className={`${prefixCls}-re-grid-right`}>{getCounts('status')}</div>
          </div>
        </div>
      </Spin>
      {/* <SyncSituation /> */}
      <EnvironmentTabs />
    </div>
  );
});

export default Content;
