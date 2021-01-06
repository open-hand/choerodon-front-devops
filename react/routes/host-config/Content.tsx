import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, Permission,
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
  } = useHostConfigStore();

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
      children: <CreateHost refresh={refresh} />,
      okText: formatMessage({ id: 'create' }),
    });
  };

  return (
    <Page service={['choerodon.code.project.deploy.host.ps.default']}>
      <Header>
        <Permission service={['choerodon.code.project.deploy.host.ps.create']}>
          <Button
            color={'primary' as ButtonColor}
            icon="playlist_add"
            onClick={handleAdd}
          >
            {formatMessage({ id: `${intlPrefix}.add` })}
          </Button>
        </Permission>
        <Permission service={['choerodon.code.project.deploy.host.ps.correct']}>
          <Button
            color={'primary' as ButtonColor}
            icon="refresh"
            onClick={handleAdjustment}
          >
            {formatMessage({ id: `${intlPrefix}.adjustment` })}
          </Button>
        </Permission>
        <Button
          color={'primary' as ButtonColor}
          icon="refresh"
          onClick={refresh}
        >
          {formatMessage({ id: 'refresh' })}
        </Button>
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
