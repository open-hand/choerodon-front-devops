import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Page, Header, Breadcrumb, Content, HeaderButtons,
} from '@choerodon/master';
import {
  Modal,
} from 'choerodon-ui/pro';
import { Loading } from '@choerodon/components';
import ContentHeader from '@/routes/host-config/components/content-header';
import ContentList from '@/routes/host-config/components/content-list';
import CreateHost from '@/routes/host-config/components/create-deploy-host';
import ResourceContent from '@/routes/host-config/components/resource-content';
import EmptyPage from '@/components/empty-page';
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
    permissionTableRefresh,
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
      okText: formatMessage({ id: hostId ? 'c7ncd.HostConfig.Save' : 'c7ncd.HostConfig.Create' }),
    });
  };

  const openPermissionManagement = useCallback(() => {
    Modal.open({
      key: permissionKey,
      title: '添加权限',
      style: {
        width: SMALL,
      },
      drawer: true,
      children: <HostPermission
        hostData={mainStore.getSelectedHost}
        refresh={permissionTableRefresh}
      />,
    });
  }, []);

  const getContent = useMemo(() => {
    if (listDs.status === 'loading' || !listDs) {
      return <Loading display type="c7n" />;
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
            name: formatMessage({ id: 'c7ncd.environment.CreateDeploymentHost' }),
            icon: 'playlist_add',
            display: true,
            permissions: ['choerodon.code.project.deploy.host.ps.create'],
            handler: () => handleAdd(),
          }, {
            name: formatMessage({ id: 'c7ncd.environment.AddPermissions' }),
            icon: 'settings-o',
            display: !!listDs.length && mainStore.getSelectedHost?.permissionLabel === 'administrator',
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
      <ContentHeader />
      <Content className={`${prefixCls}-content`}>
        {getContent}
      </Content>
    </Page>
  );
});

export default HostConfig;
