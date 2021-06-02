import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, Permission, HeaderButtons,
} from '@choerodon/boot';
import {
  Button, Modal,
} from 'choerodon-ui/pro';
import map from 'lodash/map';
import ContentHeader from '@/routes/host-config/components/content-header';
import ContentList from '@/routes/host-config/components/content-list';
import CreateHost from '@/routes/host-config/components/create-host';
import HostConfigApis from '@/routes/host-config/apis';
import { ButtonColor } from '../../interface';
import { useHostConfigStore } from './stores';

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
  }, []);

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
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.batch.correct.title` }),
      children: formatMessage({ id: `${intlPrefix}.batch.correct.des` }),
      movable: false,
      okText: formatMessage({ id: `${intlPrefix}.batch.correct` }),
      onOk: handleCorrect,
    });
  };

  const handleAdd = () => {
    Modal.open({
      key: Modal.key(),
      title: formatMessage({ id: `${intlPrefix}.add` }),
      style: {
        width: 380,
      },
      drawer: true,
      children: <CreateHost refresh={afterCreate} />,
      okText: formatMessage({ id: 'create' }),
    });
  };

  return (
    <Page service={['choerodon.code.project.deploy.host.ps.default']}>
      <Header>
        <HeaderButtons
          items={([{
            name: formatMessage({ id: `${intlPrefix}.add` }),
            icon: 'playlist_add',
            display: true,
            permissions: ['choerodon.code.project.deploy.host.ps.create'],
            handler: handleAdd,
          }, {
            name: formatMessage({ id: `${intlPrefix}.adjustment` }),
            icon: 'refresh',
            display: true,
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
        <ContentList />
      </Content>
    </Page>
  );
});

export default HostConfig;
