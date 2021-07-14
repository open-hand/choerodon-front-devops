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
import { CustomTabs } from '@choerodon/components';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import AppTypeLogo from '@/routes/app-center/components/type-logo';
import EnvOption from '@/routes/app-center/components/env-option';
import { EnvDataProps, HostDataProps } from '@/routes/app-center/app-detail/stores/useStore';
import Loading from '@/components/loading';
import { RecordObjectProps, LabelLayoutType } from '@/interface';

import './index.less';
import AppIngress from '@/routes/app-center/app-detail/components/app-ingress';

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
    mainTabKeys,
    mainTabKeys: { ENV_TAB, HOST_TAB },
    hostTabKeys,
    hostTabKeys: { APP_INSTANCE_TAB },
  } = useAppCenterDetailStore();

  const record = useMemo(() => detailDs.current, [detailDs.current]);

  const tabContent = useMemo(() => ({
    [INSTANCE_TAB]: <Instance random={Math.random()} />,
    [DEPLOYCONFIG_TAB]: <DeployConfig />,
    [SERVICEANDINGRESS_TAB]: <Net />,
    [CONFIGMAP_TAB]: <ConfigMap />,
    [SECRET_TAB]: <Secrets />,
    [APP_INSTANCE_TAB]: <AppIngress />,
  }), [mainStore.getSelectedEnv]);

  const realTabKeys = useMemo(() => {
    if (mainStore.getCurrentMainTabKey === HOST_TAB) {
      return hostTabKeys;
    }
    return appServiceType === 'project' ? tabKeys : omit(tabKeys, DEPLOYCONFIG_TAB);
  }, [appServiceType, mainStore.getCurrentMainTabKey]);

  const selectPros = useMemo(() => (
    mainStore.getCurrentMainTabKey === ENV_TAB
      ? {
        name: 'env',
        prefix: '环境:',
        onChange: (value: EnvDataProps) => handleSearch(value),
        onOption: (optionProps: RecordObjectProps) => renderOptionProperty(optionProps),
      } : {
        name: 'host',
        prefix: '主机:',
        onChange: (value: HostDataProps) => handleSelectHost(value),
      }
  ), [mainStore.getCurrentMainTabKey]);

  const refresh = useCallback(() => {
    detailDs.query();
  }, []);

  const handleTabChange = useCallback((tabKey: string) => {
    mainStore.setCurrentTabKey(tabKey);
  }, []);

  const handleMainTabChange = useCallback((
    e: React.MouseEvent<HTMLDivElement, MouseEvent>, name: string, tabKey: string,
  ) => {
    mainStore.setCurrentMainTabKey(tabKey);
    // @ts-ignore
    mainStore.setCurrentTabKey(tabKey === ENV_TAB ? INSTANCE_TAB : APP_INSTANCE_TAB);
  }, []);

  const handleSearch = useCallback((value: EnvDataProps) => {
    mainStore.setSelectedEnv(value);
  }, []);

  const handleSelectHost = useCallback((value: HostDataProps) => {
    mainStore.setSelectedHost(value);
  }, []);

  const renderEnvOption = useCallback(({ value, text, record: envRecord }) => (
    <EnvOption
      connect={value?.connect || envRecord.get('connect')
      || value?.hostStatus === 'connected' || envRecord.get('hostStatus') === 'connected'}
      text={text}
    />
  ), []);

  const renderOptionProperty = useCallback(({ record: envRecord }: RecordObjectProps) => ({
    disabled: !envRecord.get('permission'),
  }), []);

  if (!record) {
    return <Loading display />;
  }

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
        <div className={`${prefixCls}-detail-main`}>
          <CustomTabs
            data={map(mainTabKeys, (value: string, key: string) => ({
              name: formatMessage({ id: `${intlPrefix}.detail.tab.${key}` }),
              value,
            }))}
            selectedTabValue={mainStore.getCurrentMainTabKey}
            onChange={handleMainTabChange}
          />
          <Form
            dataSet={searchDs}
            className={`${prefixCls}-detail-env`}
            columns={2}
            labelLayout={'horizontal' as LabelLayoutType}
          >
            <Select
              {...selectPros}
              searchable
              optionRenderer={renderEnvOption}
              renderer={renderEnvOption}
            />
          </Form>
        </div>
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
