import React, {
  useMemo,
  useCallback,
  cloneElement,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Content, Header, HeaderButtons, Breadcrumb,
} from '@choerodon/master';
import { Tabs, message } from 'choerodon-ui';
import map from 'lodash/map';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useRouteMatch } from 'react-router';
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
import { handleTabDataValidate } from './services/handleTabsDataValidate';
import { handleTabDataTransform } from './services/handleTabDataTransform';
import { ciCdPipelineApi } from '@/api/cicd-pipelines';

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
    level,
    onSave,
    onCreate,
  } = usePipelineContext();

  const {
    params: {
      id,
    },
  } = useRouteMatch<any>();

  const contentCls = classNames(`${prefixCls}-content`, {
    [`${prefixCls}-content-bgnone`]: TAB_FLOW_CONFIG === currentKey,
  });

  const getBasicInfo = () => {
    const tempObj:Record<string, JSX.Element> = {
    };
    if (basicInfo && !isEmpty(basicInfo)) {
      const { Component } = basicInfo;
      tempObj[TAB_BASIC] = cloneElement(Component, { useTabData });
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

  /**
   * 项目层的处理提交的事件
   */
  const handleSumitWhileProjectCreate = () => {
    const { isValidated, key, reason } = handleTabDataValidate(tabsData);
    if (isValidated) {
      const finalData = handleTabDataTransform(tabsData);
      try {
        const res = ciCdPipelineApi.handlePipelineCreate(finalData);
      } catch (error) {
        throw new Error(error);
      }
    } else {
      key && setTabKey(key);
      reason && message.info(reason);
    }
  };


  /**
   * 项目层的编辑
   */
  const handleSumitWhileProjectEdit = () => {
    const { isValidated, key, reason } = handleTabDataValidate(tabsData);
    if (isValidated) {
      const finalData = handleTabDataTransform(tabsData);
      try {
        const res = ciCdPipelineApi.handlePipelineModify(id, finalData);
      } catch (error) {
        throw new Error(error);
      }
    } else {
      key && setTabKey(key);
      reason && message.info(reason);
    }
  };

  const submitMapWhileCreate = {
    project: handleSumitWhileProjectCreate,
    site: onCreate,
    orgnization: onCreate,
  };

  const submitMapWhileEdit = {
    project: handleSumitWhileProjectEdit,
    site: onSave,
    orgnization: onSave,
  };

  const handleSubmit = () => {
    console.log(tabsData);
    if (type === 'create') {
      return level && submitMapWhileCreate[level]?.(tabsData);
    }
    return level && submitMapWhileEdit[level]?.(tabsData);
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
    let title = '';
    if (level === 'project') {
      if (type === 'create') {
        title = '创建流水线';
      }
      title = '编辑流水线';
    } else {
      title = '创建流水线模板';
    }
    return title;
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
