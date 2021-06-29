import React, { Suspense, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Breadcrumb, Content, Header, HeaderButtons, Page,
} from '@choerodon/boot';
import {
  Modal, Spin, Form, Select, Tabs,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import omit from 'lodash/omit';
import { useAppCenterDetailStore } from '@/routes/app-center/app-detail/stores';
import AppTypeLogo from '@/routes/app-center/components/type-logo';
import EnvOption from '@/routes/app-center/components/env-option';

import './index.less';

const DeployConfig = React.lazy(() => import('./deploy-config'));

const linkServiceKey = Modal.key();
const deployKey = Modal.key();
const batchDeployKey = Modal.key();

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
    [INSTANCE_TAB]: <div>实例</div>,
    [DEPLOYCONFIG_TAB]: <DeployConfig />,
    [SERVICEANDINGRESS_TAB]: <div>网络与域名</div>,
    [CONFIGMAP_TAB]: <div>配置映射</div>,
    [SECRET_TAB]: <div>密文</div>,
  }), []);

  const realTabKeys = useMemo(() => (
    appServiceType === 'project' ? tabKeys : omit(tabKeys, ['DEPLOYCONFIG_TAB'])
  ), [appServiceType]);

  const refresh = useCallback(() => {

  }, []);

  const handleTabChange = useCallback((tabKey) => {
    mainStore.setCurrentTabKey(tabKey);
  }, []);

  const handleSearch = useCallback(() => {

  }, []);

  const renderEnvOption = useCallback(({ record: envRecord, text }) => (
    <EnvOption record={envRecord} text={text} />
  ), []);

  if (!record) {
    return <Spin />;
  }

  return (
    <Page>
      <Breadcrumb title="应用详情" />
      <Content className={`${prefixCls}-detail`}>
        <div className={`${prefixCls}-detail-header`}>
          <AppTypeLogo type={appServiceType} size={24} />
          <span className={`${prefixCls}-detail-header-name`}>{record.get('name')}</span>
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
            onChange={handleSearch}
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
