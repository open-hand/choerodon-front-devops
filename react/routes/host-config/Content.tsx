import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, HeaderButtons,
} from '@choerodon/boot';
import {
  Modal,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import ContentHeader from '@/routes/host-config/components/content-header';
import ContentList from '@/routes/host-config/components/content-list';
import CreateHost from '@/routes/host-config/components/create-deploy-host';
import HostConfigApis from '@/routes/host-config/apis';
import ResourceContent from '@/routes/host-config/components/resource-content';
import EmptyPage from '@/components/empty-page';
import Loading from '@/components/loading';
import { SMALL } from '@/utils/getModalWidth';
import { has, mount } from '@choerodon/inject';
import { useHostConfigStore } from './stores';

const testHostKey = Modal.key();
const deployHostKey = Modal.key();
const adjustKey = Modal.key();

const HostConfig: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    intlPrefix,
    formatMessage,
    refresh,
    listDs,
    projectId,
    mainStore,
    searchDs,
    tabKey: {
      DEPLOY_TAB,
      TEST_TAB,
    },
  } = useHostConfigStore();

  const afterCreate = useCallback((selectedTabKey?: string) => {
    if (selectedTabKey && selectedTabKey !== mainStore.getCurrentTabKey) {
      searchDs.reset();
      listDs.setQueryParameter('type', selectedTabKey);
      listDs.setQueryParameter('params', '');
      listDs.setQueryParameter('status', '');
      mainStore.setCurrentTabKey(selectedTabKey);
    }
    refresh();
  }, [mainStore.getCurrentTabKey]);

  const handleCorrect = async ():Promise<boolean> => {
    try {
      const postData = map(listDs.toData(), 'id');
      const res = await HostConfigApis.batchCorrect(
        projectId, postData, mainStore.getCurrentTabKey,
      );
      if (res && res.failed) {
        return false;
      }
      refresh();
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAdjustment = () => {
    Modal.open({
      key: adjustKey,
      title: formatMessage({ id: `${intlPrefix}.batch.correct.title` }),
      children: formatMessage({ id: `${intlPrefix}.batch.correct.des` }),
      movable: false,
      okText: formatMessage({ id: `${intlPrefix}.batch.correct` }),
      onOk: handleCorrect,
    });
  };

  const handleAdd = () => {
    Modal.open({
      key: deployHostKey,
      title: formatMessage({ id: `${intlPrefix}.add.deploy` }),
      style: {
        width: SMALL,
      },
      drawer: true,
      children: <CreateHost refresh={afterCreate} />,
      okText: formatMessage({ id: 'create' }),
    });
  };

  const handleCreateTestHost = () => {
    Modal.open({
      key: testHostKey,
      title: formatMessage({ id: `${intlPrefix}.add.test` }),
      style: {
        width: SMALL,
      },
      drawer: true,
      children: has('test-pro:create-host') && mount('test-pro:create-host', { refresh: afterCreate }),
      okText: formatMessage({ id: 'create' }),
    });
  };

  const getContent = useMemo(() => {
    if (listDs.status === 'loading' || !listDs) {
      return <Loading display />;
    }
    if (listDs && !listDs.length) {
      // @ts-ignore
      return <EmptyPage title="暂无主机" describe="项目下暂无主机，请创建" />;
    }
    return (
      <div className={`${prefixCls}-content-wrap`}>
        <ContentList />
        {mainStore.getCurrentTabKey === DEPLOY_TAB && <ResourceContent />}
      </div>
    );
  }, [listDs, listDs.length, mainStore.getCurrentTabKey, listDs.status]);

  return (
    <Page service={['choerodon.code.project.deploy.host.ps.default']}>
      <Header>
        <HeaderButtons
          items={([{
            name: formatMessage({ id: `${intlPrefix}.add.test` }),
            icon: 'playlist_add',
            display: mainStore.getCurrentTabKey === TEST_TAB,
            permissions: ['choerodon.code.project.deploy.host.ps.create'],
            handler: handleCreateTestHost,
          }, {
            name: formatMessage({ id: `${intlPrefix}.add.deploy` }),
            icon: 'playlist_add',
            display: mainStore.getCurrentTabKey === DEPLOY_TAB,
            permissions: ['choerodon.code.project.deploy.host.ps.create'],
            handler: handleAdd,
          }, {
            name: formatMessage({ id: `${intlPrefix}.adjustment` }),
            icon: 'refresh',
            display: mainStore.getCurrentTabKey === TEST_TAB,
            permissions: ['choerodon.code.project.deploy.host.ps.correct'],
            handler: handleAdjustment,
          }, {
            icon: 'refresh',
            display: true,
            handler: refresh,
          }])}
          showClassName={false}
        />
      </Header>
      <Breadcrumb />
      <Content className={`${prefixCls}-content`}>
        <ContentHeader />
        {getContent}
      </Content>
    </Page>
  );
});

export default HostConfig;
