import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, HeaderButtons,
} from '@choerodon/boot';
import {
  Modal,
} from 'choerodon-ui/pro';
import ContentHeader from '@/routes/host-config/components/content-header';
import ContentList from '@/routes/host-config/components/content-list';
import CreateHost from '@/routes/host-config/components/create-deploy-host';
import ResourceContent from '@/routes/host-config/components/resource-content';
import EmptyPage from '@/components/empty-page';
import Loading from '@/components/loading';
import { SMALL } from '@/utils/getModalWidth';
import HostPermission from '@/routes/host-config/components/permission-management';
import { useHostConfigStore } from './stores';

const deployHostKey = Modal.key();
const permissionKey = Modal.key();

const HostConfig: React.FC<any> = observer((): any => {
  const {
    prefixCls,
    intlPrefix,
    formatMessage,
    refresh,
    listDs,
    mainStore,
  } = useHostConfigStore();

  const handleAdd = (hostId?: string) => {
    Modal.open({
      key: deployHostKey,
      title: formatMessage({ id: `${intlPrefix}.${hostId ? 'edit' : 'add'}.deploy` }),
      style: {
        width: SMALL,
      },
      drawer: true,
      children: <CreateHost refresh={refresh} hostId={hostId} />,
      okText: formatMessage({ id: hostId ? 'save' : 'create' }),
    });
  };

  const openPermissionManagement = useCallback(() => {
    Modal.open({
      key: permissionKey,
      title: formatMessage({ id: 'permission_management' }),
      style: {
        width: SMALL,
      },
      drawer: true,
      children: <HostPermission hostData={mainStore.getSelectedHost} refresh={refresh} />,
    });
  }, []);

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
        <ContentList
          handleCreateDeployHost={handleAdd}
        />
        <ResourceContent />
      </div>
    );
  }, [listDs, listDs.length, listDs.status]);

  return (
    <Page service={['choerodon.code.project.deploy.host.ps.default']}>
      <Header>
        <HeaderButtons
          items={([{
            name: formatMessage({ id: `${intlPrefix}.add.deploy` }),
            icon: 'playlist_add',
            display: true,
            permissions: ['choerodon.code.project.deploy.host.ps.create'],
            handler: () => handleAdd(),
          }, {
            name: formatMessage({ id: 'permission_management' }),
            icon: 'settings-o',
            display: true,
            permissions: ['choerodon.code.project.deploy.host.ps.permission'],
            handler: openPermissionManagement,
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
