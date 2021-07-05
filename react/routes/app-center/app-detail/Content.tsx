import React, { Suspense, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Breadcrumb, Content, Page,
} from '@choerodon/boot';
import {
  Modal, Spin, Form, Select, Tabs,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import omit from 'lodash/omit';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import AppTypeLogo from '@/routes/app-center/components/type-logo';
import EnvOption from '@/routes/app-center/components/env-option';
import { EnvDataProps } from '@/routes/app-center/app-detail/stores/useStore';
import Loading from '@/components/loading';
import { RecordObjectProps } from '@/interface';

import './index.less';

const DeployConfig = React.lazy(() => import('./components/deploy-config'));
const ConfigMap = React.lazy(() => import('./components/config-map'));
const Secrets = React.lazy(() => import('./components/secrets'));
const Instance = React.lazy(() => import('./components/instance'));
const Net = React.lazy(() => import('./components/net'));

const { TabPane } = Tabs;

const AppCenterDetailContent = () => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    mainStore,
    detailDs,
    appServiceType,
    searchDs,
    tabKeys,
    tabKeys: {
      INSTANCE_TAB, DEPLOYCONFIG_TAB, SERVICEANDINGRESS_TAB, CONFIGMAP_TAB, SECRET_TAB,
    },
  } = useAppCenterDetailStore();

  const record = useMemo(() => detailDs.current, [detailDs.current]);

  const tabContent = useMemo(() => ({
    [INSTANCE_TAB]: <Instance />,
    [DEPLOYCONFIG_TAB]: <DeployConfig />,
    [SERVICEANDINGRESS_TAB]: <Net />,
    [CONFIGMAP_TAB]: <ConfigMap />,
    [SECRET_TAB]: <Secrets />,
  }), []);

  const realTabKeys = useMemo(() => (
    appServiceType === 'project' ? tabKeys : omit(tabKeys, ['DEPLOYCONFIG_TAB'])
  ), [appServiceType]);

  const refresh = useCallback(() => {
    detailDs.query();
  }, []);

  const handleTabChange = useCallback((tabKey: string) => {
    mainStore.setCurrentTabKey(tabKey);
  }, []);

  const handleSearch = useCallback((value: EnvDataProps) => {
    mainStore.setSelectedEnv(value);
  }, []);

  const renderEnvOption = useCallback(({ value, text, record: envRecord }) => (
    <EnvOption connect={value?.connect || envRecord.get('connect')} text={text} />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  if (!record) {
    return <Loading display />;
  }

  // @ts-ignore
  return (
    <Page>
      <Breadcrumb title="应用详情" />
      <Content className={`${prefixCls}-detail`}>
        <div className={`${prefixCls}-detail-header`}>
          <AppTypeLogo type={appServiceType} size={24} />
          <span className={`${prefixCls}-detail-header-name`}>
            {record.get('name') || record.get('marketServiceName')}
          </span>
          {record.get('code') && (
            <span>
              (
              {record.get('code')}
              )
            </span>
          )}
        </div>
        <Form dataSet={searchDs} className={`${prefixCls}-detail-env`} columns={3}>
          <Select
            label="环境:"
            name="env"
            placeholder="请选择"
            searchable
            optionRenderer={renderEnvOption}
            renderer={renderEnvOption}
            onChange={handleSearch}
            onOption={renderOptionProperty}
          />
        </Form>
        <Tabs
          className={`${prefixCls}-detail-tabs`}
          animated={false}
          activeKey={mainStore.getCurrentTabKey}
          onChange={handleTabChange}
        >
          {map(realTabKeys, (value: string, key: string) => (
            <TabPane
              key={value}
              tab={formatMessage({ id: `${intlPrefix}.detail.tab.${key}` })}
            >
              <Suspense fallback={<Spin />}>
                {/* @ts-ignore */}
                {tabContent[value]}
              </Suspense>
            </TabPane>
          ))}
        </Tabs>
      </Content>
    </Page>
  );
};

export default observer(AppCenterDetailContent);
