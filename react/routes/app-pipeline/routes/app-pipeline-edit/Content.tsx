import React, {
  useMemo,
  useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Content, Header, HeaderButtons, Breadcrumb,
} from '@choerodon/master';
import { useRouteMatch } from 'react-router';
import { Tabs } from 'choerodon-ui';
import map from 'lodash/map';
import classNames from 'classnames';
import { useAppPipelineEditStore } from './stores';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from './stores/CONSTANTS';
import { TabkeyTypes } from './interface';
import PipelineBasicInfo from './components/pipeline-basic-info';
import StagesEdits from './components/stage-edits';
import CiVariasConfigs from './components/ci-varias-configs';
import PipelineAdvancedConfig from './components/pipeline-advanced-config';

const { TabPane } = Tabs;

const AppPipelineEdit = () => {
  const {
    prefixCls,
    formatAppPipelineEdit,
    formatCommon,
    currentKey,
    setTabKey,
  } = useAppPipelineEditStore();

  const { params } = useRouteMatch<{id:string}>();

  const contentCls = classNames(`${prefixCls}-content`, {
    [`${prefixCls}-content-bgnone`]: TAB_FLOW_CONFIG === currentKey,
  });

  const tabsCompoents = {
    [TAB_BASIC]: <PipelineBasicInfo />,
    [TAB_FLOW_CONFIG]: <StagesEdits />,
    [TAB_CI_CONFIG]: <CiVariasConfigs />,
    [TAB_ADVANCE_SETTINGS]: <PipelineAdvancedConfig />,
  };

  const handleTabChange = (value:TabkeyTypes) => setTabKey(value);

  const headerItems = useMemo(() => ([
    {
      handler: () => {},
      name: formatCommon({ id: 'save' }),
      icon: 'check',
    },
    {
      handler: () => {},
      name: formatCommon({ id: 'cancel' }),
      icon: 'close',
    },
  ]), []);

  const renderTabHeader = useCallback(() => (
    <Tabs
      className={`${prefixCls}-tabs`}
      activeKey={currentKey}
      onChange={handleTabChange}
    >
      {
        map(tabsCompoents, (_componet, key) => (
          <TabPane tab={formatAppPipelineEdit({ id: key })} key={key} />
        ))
      }
    </Tabs>
  ), [currentKey]);

  return (
    <Page className={prefixCls}>
      <Header>
        <HeaderButtons items={headerItems} />
      </Header>
      <Breadcrumb
        title={`编辑流水线${params?.id}`}
        extraNode={renderTabHeader()}
      />
      <Content className={contentCls}>
        {tabsCompoents[currentKey]}
      </Content>
    </Page>
  );
};

export default observer(AppPipelineEdit);
