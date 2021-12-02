import React from 'react';
import {
  Page, Content, Breadcrumb,
} from '@choerodon/master';
import { Spin } from 'choerodon-ui/pro';
import { withRouter, Prompt } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useRepositoryStore } from './stores';
import RepositoryForm from './repository-form';

import './index.less';

const Repository = withRouter(observer((props) => {
  const {
    AppState: { currentMenuType: { organizationId } },
    intlPrefix,
    prefixCls,
    permissions,
    detailDs,
    repositoryStore,
    promptMsg,
    formatClient,
    formatCommon,
  } = useRepositoryStore();

  const refresh = () => {
    detailDs.query();
  };

  return (
    <Page
      service={permissions}
    >
      <Breadcrumb />
      <Prompt message={promptMsg} when={detailDs.current ? detailDs.current.dirty : false} />
      <Content className={`${prefixCls}-home`}>
        {detailDs.current ? (
          <RepositoryForm
            record={detailDs.current}
            dataSet={detailDs}
            store={repositoryStore}
            id={organizationId}
            intlPrefix={intlPrefix}
            prefixCls={prefixCls}
            refresh={refresh}
            formatClient={formatClient}
            formatCommon={formatCommon}
          />
        ) : <Spin />}
      </Content>
    </Page>
  );
}));

export default Repository;
