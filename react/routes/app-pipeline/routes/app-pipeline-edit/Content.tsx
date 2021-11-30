import React, {
  useState,
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
import { useSetState } from 'ahooks';
import get from 'lodash/get';
import classNames from 'classnames';
import { useAppPipelineEditStore } from './stores';
import {
  TAB_ADVANCE_SETTINGS, TAB_BASIC, TAB_CI_CONFIG, TAB_FLOW_CONFIG, tabsGroup,
} from './stores/CONSTANTS';
import { TabkeyTypes } from './interface';
import PipelineBasicInfo from './components/pipeline-basic-info';
import StagesEdits from './components/stage-edits';

const { TabPane } = Tabs;

type BasicInfoDataTypes = {

}

const AppPipelineEdit = () => {
  const {
    prefixCls,
    formatAppPipelineEdit,
    formatCommon,
  } = useAppPipelineEditStore();

  const { params } = useRouteMatch<{id:string}>();

  const [currentKey, setTabKey] = useState<TabkeyTypes>(TAB_BASIC);

  const [tabsData, setTabsDataState] = useSetState<BasicInfoDataTypes>({

  });

  const savedHandler = useMemo(() => [get(tabsData, currentKey), (data:unknown) => {
    setTabsDataState({
      [currentKey]: data,
    });
  }] as const, [currentKey]);

  const contentCls = classNames(`${prefixCls}-content`, {
    [`${prefixCls}-content-bgnone`]: TAB_FLOW_CONFIG === currentKey,
  });

  const tabsCompoents = {
    [TAB_BASIC]: <PipelineBasicInfo savedHandler={savedHandler} />,
    [TAB_FLOW_CONFIG]: <StagesEdits savedHandler={savedHandler} />,
    [TAB_CI_CONFIG]: () => <>121</>,
    [TAB_ADVANCE_SETTINGS]: () => <>fgf</>,
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
    <Tabs className={`${prefixCls}-tabs`} activeKey={currentKey} onChange={handleTabChange}>
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
