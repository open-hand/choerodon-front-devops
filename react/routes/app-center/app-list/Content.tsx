import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Breadcrumb, Content, Header, HeaderButtons, Page,
} from '@choerodon/boot';
import { Modal } from 'choerodon-ui/pro';
import { LARGE, SMALL } from '@/utils/getModalWidth';
import Loading from '@/components/Loading';
import ContentHeader from '@/routes/app-center/app-list/content-header';
import Deploy from '@/routes/deployment/modals/deploy';
import BatchDeploy from '@/routes/deployment/modals/batch-deploy';
import Tips from '@/components/new-tips';
import LinkService from '@/routes/app-center/app-list/components/link-service';
import ContentList from '@/routes/app-center/app-list/content-list';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';

import './index.less';

const linkServiceKey = Modal.key();
const deployKey = Modal.key();
const batchDeployKey = Modal.key();

const AppCenterContent = () => {
  const {
    formatMessage,
    intlPrefix,
    prefixCls,
    listDs,
    mainStore,
    deployStore,
  } = useAppCenterListStore();

  const resourceIntlPrefix = useMemo(() => 'c7ncd.deployment', []);
  const intlPrefixDeploy = useMemo(() => 'c7ncd.deploy', []);

  const refresh = useCallback(() => {
    listDs.query();
  }, []);

  const openLinkService = useCallback(() => {
    Modal.open({
      key: linkServiceKey,
      title: <Tips
        helpText={formatMessage({ id: `${resourceIntlPrefix}.service.tips` })}
        title={formatMessage({ id: `${resourceIntlPrefix}.modal.service.link` })}
      />,
      style: { width: SMALL },
      drawer: true,
      className: 'c7ncd-modal-wrapper',
      children: <LinkService
        showEnvSelect
        refresh={refresh}
      />,
    });
  }, []);

  function openDeploy() {
    Modal.open({
      key: deployKey,
      style: { width: LARGE },
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
      children: <Deploy
        deployStore={deployStore}
        refresh={refresh}
        intlPrefix={intlPrefixDeploy}
        prefixCls="c7ncd-deploy"
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  function openBatchDeploy() {
    Modal.open({
      key: batchDeployKey,
      style: { width: LARGE },
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
      children: <BatchDeploy
        deployStore={deployStore}
        refresh={refresh}
        intlPrefix={intlPrefixDeploy}
        prefixCls="c7ncd-deploy"
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setShareAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  }

  const getContent = useMemo(() => {

    // if (listDs.status === 'loading' || !listDs) {
    //   return <Loading display />;
    // }
    // if (listDs && !listDs.length) {
    //   // @ts-ignore
    //   return <EmptyPage title="暂无环境" describe="项目下暂无环境，请创建" />;
    // }
    // return (
    //   <ContentList />
    // )
  }, [listDs, listDs.length, mainStore.getCurrentTabKey]);

  return (
    <Page>
      <Header>
        <HeaderButtons
          items={([{
            permissions: [],
            name: formatMessage({ id: `${resourceIntlPrefix}.modal.service.link` }),
            icon: 'relate',
            handler: openLinkService,
            display: true,
          }, {
            permissions: [],
            name: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
            icon: 'cloud_done-o',
            handler: openDeploy,
            display: true,
          }, {
            permissions: [],
            name: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
            icon: 'cloud_done-o',
            handler: openBatchDeploy,
            display: true,
          }, {
            icon: 'refresh',
            display: true,
            handler: refresh,
          }])}
        />
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-list`}>
        <ContentHeader />
        <ContentList />
      </Content>
    </Page>
  );
};

export default observer(AppCenterContent);
