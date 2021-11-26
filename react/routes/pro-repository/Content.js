import React from 'react';
import {
  Page, Content, Breadcrumb,
} from '@choerodon/master';
import { Spin } from 'choerodon-ui/pro';
import { withRouter, Prompt } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useRepositoryStore } from './stores';
import RepositoryForm from '../repository/repository-form';

import './index.less';

const ProRepository = withRouter(observer(() => {
  const {
    AppState: { currentMenuType: { id } },
    intlPrefix,
    prefixCls,
    permissions,
    detailDs,
    repositoryStore,
    promptMsg,
    formatCommon,
    formatRepository,
  } = useRepositoryStore();

  function refresh() {
    detailDs.query();
  }

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
            id={id}
            isProject
            intlPrefix={intlPrefix}
            formatCommon={formatCommon}
            formatRepository={formatRepository}
            prefixCls={prefixCls}
            refresh={refresh}
          />
        ) : <Spin />}
      </Content>
    </Page>
  );
}));

export default ProRepository;
