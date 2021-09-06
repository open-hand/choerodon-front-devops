import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Breadcrumb, Content, Header, HeaderButtons, Page,
} from '@choerodon/boot';
import { Modal } from 'choerodon-ui/pro';
import { TabCode } from '@choerodon/master';
import { useHistory, useLocation } from 'react-router';
import { LARGE, SMALL } from '@/utils/getModalWidth';
import ContentHeader from '@/routes/app-center/app-list/content-header';
import Deploy from '@/routes/deployment/modals/deploy';
import BatchDeploy from '@/routes/deployment/modals/batch-deploy';
import Tips from '@/components/new-tips';
import LinkService from '@/routes/app-center/app-list/components/link-service';
import ContentList from '@/routes/app-center/app-list/content-list';
import { useAppCenterListStore } from '@/routes/app-center/app-list/stores';
import EmptyPage from '@/components/empty-page';
import Loading from '@/components/loading';

import './index.less';

interface InstanceProps {
  config: boolean,
  id: string,
  appServiceId: string,
  envId: string,
}

interface DeployProps {
  marketAppVersionId?: string,
  marketServiceId?: string,
  appServiceSource: string,
  appServiceId: string
}

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
    typeTabKeys: { HOST_TAB },
  } = useAppCenterListStore();

  const history = useHistory();
  const { search } = useLocation();

  const resourceIntlPrefix = useMemo(() => 'c7ncd.deployment', []);
  const intlPrefixDeploy = useMemo(() => 'c7ncd.deploy', []);
  const isHost = useMemo(() => (
    mainStore.getCurrentTypeTabKey === HOST_TAB
  ), [mainStore.getCurrentTypeTabKey]);

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

  const deployAfter = useCallback((instance: InstanceProps, type = 'instance') => {
    if (instance.config) {
      refresh();
    } else {
      history.push({
        pathname: '/devops/resource',
        search: `${search}&activeKey=${TabCode.get('/devops/resource').tabCodes[0]}`,
        state: {
          instanceId: instance.id,
          appServiceId: instance.appServiceId,
          envId: instance.envId,
          viewType: type,
        },
      });
    }
  }, [search]);

  const openDeploy = (data?: DeployProps) => {
    Modal.open({
      key: deployKey,
      style: { width: LARGE },
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
      children: <Deploy
        deployStore={deployStore}
        refresh={deployAfter}
        intlPrefix={intlPrefixDeploy}
        prefixCls="c7ncd-deploy"
        {...data || {}}
      />,
      afterClose: () => {
        deployStore.setCertificates([]);
        deployStore.setAppService([]);
        deployStore.setConfigValue('');
      },
      okText: formatMessage({ id: 'deployment' }),
    });
  };

  const openBatchDeploy = () => {
    Modal.open({
      key: batchDeployKey,
      style: { width: LARGE },
      drawer: true,
      title: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
      children: <BatchDeploy
        deployStore={deployStore}
        refresh={deployAfter}
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
  };

  const getContent = useMemo(() => {
    if (listDs.status === 'loading' || !listDs) {
      return <Loading display />;
    }
    if (listDs && !listDs.length) {
      // @ts-ignore
      return <EmptyPage title="暂无数据" describe="暂无应用服务，请关联应用服务" access />;
    }
    return <ContentList openDeploy={openDeploy} />;
  }, [listDs, listDs.length, mainStore.getCurrentTabKey, listDs.status]);

  return (
    <Page>
      <Header>
        <HeaderButtons
          items={([{
            permissions: ['choerodon.code.project.deploy.app-deployment.application-center.link'],
            name: formatMessage({ id: `${resourceIntlPrefix}.modal.service.link` }),
            icon: 'relate',
            handler: openLinkService,
            display: !isHost,
          }, {
            permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.manual'],
            name: formatMessage({ id: `${intlPrefixDeploy}.manual` }),
            icon: 'cloud_done-o',
            handler: () => openDeploy(),
            display: !isHost,
          }, {
            permissions: ['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.batch'],
            name: formatMessage({ id: `${intlPrefixDeploy}.batch` }),
            icon: 'cloud_done-o',
            handler: openBatchDeploy,
            display: !isHost,
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
        {getContent}
      </Content>
    </Page>
  );
};

export default observer(AppCenterContent);
