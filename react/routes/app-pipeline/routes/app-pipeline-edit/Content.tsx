import React, {
  useMemo,
  useCallback,
  cloneElement,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Content, Header, HeaderButtons, Breadcrumb,
} from '@choerodon/master';
import { Tabs } from 'choerodon-ui';
import map from 'lodash/map';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useAppPipelineEditStore } from './stores';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG,
} from './stores/CONSTANTS';
import PipelineBasicInfo from './components/pipeline-basic-info';
import StagesEdits from './components/stage-edits';
import CiVariasConfigs from './components/ci-varias-configs';
import PipelineAdvancedConfig from './components/pipeline-advanced-config';
import { TabkeyTypes } from '../../interface';
import useTabData from './hooks/useTabData';
import usePipelineContext from '../../hooks/usePipelineContext';

const { TabPane } = Tabs;

const AppPipelineEdit = () => {
  const {
    prefixCls,
    formatAppPipelineEdit,
    formatCommon,
    currentKey,
    setTabKey,
    type,
    tabsData,
  } = useAppPipelineEditStore();

  const {
    basicInfo,
    onSave,
    onCreate,
  } = usePipelineContext();

  const contentCls = classNames(`${prefixCls}-content`, {
    [`${prefixCls}-content-bgnone`]: TAB_FLOW_CONFIG === currentKey,
  });

  const getBasicInfo = () => {
    const tempObj:Record<string, JSX.Element> = {
    };
    if (basicInfo && !isEmpty(basicInfo)) {
      const { key, Component } = basicInfo;
      tempObj[key] = cloneElement(Component, { useTabData });
    } else {
      tempObj[TAB_BASIC] = <PipelineBasicInfo />;
    }
    return tempObj;
  };

  const tabsCompoents:Record<string, JSX.Element> = {
    ...getBasicInfo(),
    [TAB_FLOW_CONFIG]: <StagesEdits />,
    [TAB_CI_CONFIG]: <CiVariasConfigs />,
    [TAB_ADVANCE_SETTINGS]: <PipelineAdvancedConfig />,
  };

  const handleTabChange = (value:TabkeyTypes) => setTabKey(value);

  const handleSubmit = () => {
    if (type === 'create') {
      onSave?.(tabsData);
    } else {
      onCreate?.(tabsData);
    }

    console.log(tabsData);
  };

  const headerItems = useMemo(() => ([
    {
      handler: handleSubmit,
      name: formatCommon({ id: 'save' }),
      icon: 'check',
    },
    {
      handler: () => {},
      name: formatCommon({ id: 'cancel' }),
      icon: 'close',
    },
  ]), [handleSubmit]);

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

  const renderTitle = () => {
    if (type === 'create') {
      return '创建流水线';
    }
    return '编辑流水线';
  };

  return (
    <Page className={prefixCls}>
      <Header>
        <HeaderButtons items={headerItems} />
      </Header>
      <Breadcrumb
        title={renderTitle()}
        extraNode={renderTabHeader()}
      />
      <Content className={contentCls}>
        {tabsCompoents[currentKey]}
      </Content>
    </Page>
  );
};

export default observer(AppPipelineEdit);
