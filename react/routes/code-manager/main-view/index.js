import React, { Fragment, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { PageWrap, PageTab, Page } from '@choerodon/boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { useTabActiveKey } from '@choerodon/components';
import map from 'lodash/map';
import { TabCode } from '@choerodon/master';
import { useCodeManagerStore } from '../stores';
import EmptyShown, { EmptyLoading } from './empty';
import CodeQuality from './code-quality';
import CodeManagerBranch from './branch';
import CodeManagerMergeRequest from './merge-request';
import CodeManagerAppTag from './app-tag';
import CodeManagerCiPipelineManage from './ci-pipeline-manage';
import Tips from '../../../components/new-tips';

import './index.less';
import './theme4.less';

const { tabCodes } = TabCode.get('/devops/code-management');

const MainView = injectIntl(observer((props) => {
  const { intl: { formatMessage } } = props;
  const {
    permissions,
    codeManagerStore,
    AppState,
  } = useCodeManagerStore();
  const { getLoading, getHasApp } = codeManagerStore;

  const [activeKey, setActiveKey] = useTabActiveKey(tabCodes[0]);

  function getContent() {
    if (getLoading) return <EmptyLoading formatMessage={formatMessage} />;

    const titleData = ['master', 'feature', 'bugfix', 'release', 'hotfix', 'custom'];
    const popoverContent = map(titleData, (item) => (
      <div className="c7n-branch-block" key={item}>
        <span className={`branch-popover-span span-${item}`} />
        <div className="branch-popover-content">
          <p className="branch-popover-p">
            <FormattedMessage id={`branch.${item}`} />
          </p>
          <p>
            <FormattedMessage id={`branch.${item}Des`} />
          </p>
        </div>
      </div>
    ));

    return getHasApp ? (
      <PageWrap noHeader={[]} cache onChange={(key) => setActiveKey(key)}>
        <PageTab
          title={(
            <Tips
              helpText={popoverContent}
              title={formatMessage({ id: 'code-management.branch' })}
              popoverClassName="branch-popover"
              placement="bottomLeft"
            />
          )}
          tabKey={tabCodes[0]}
          component={CodeManagerBranch}
          alwaysShow
        />
        <PageTab
          title={formatMessage({ id: 'code-management.merge-request' })}
          tabKey={tabCodes[1]}
          component={CodeManagerMergeRequest}
          alwaysShow
        />
        <PageTab
          title={formatMessage({ id: 'code-management.ci-pipeline' })}
          tabKey={tabCodes[2]}
          component={CodeManagerCiPipelineManage}
          alwaysShow
        />
        <PageTab
          title={formatMessage({ id: 'code-management.app-tag' })}
          tabKey={tabCodes[3]}
          component={CodeManagerAppTag}
          alwaysShow
        />
        <PageTab
          title={formatMessage({ id: 'code-management.code-quality' })}
          tabKey={tabCodes[4]}
          component={CodeQuality}
          alwaysShow
        />
      </PageWrap>
    ) : <EmptyShown />;
  }
  return (
    <Page>
      <div
        className={classNames({
          'c7n-code-managerment-tab-list': true,
          'c7ncd-theme4-management': AppState.getCurrentTheme === 'theme4',
        })}
      >
        {getContent()}
      </div>
    </Page>
  );
}));

export default MainView;
