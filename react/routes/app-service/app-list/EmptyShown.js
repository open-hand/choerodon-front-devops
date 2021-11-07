import React, { Fragment } from 'react';
import {
  Header, Content, Breadcrumb, HeaderButtons,
} from '@choerodon/master';
import { Button } from 'choerodon-ui';
import { EmptyPage, Loading } from '@choerodon/components';
import { useAppTopStore } from '../stores';
import emptyImage from '../images/empty.svg';

export function EmptyLoading({ formatMessage }) {
  return (
    <>
      <Header>
        <Button
          icon="refresh"
          type="primary"
          funcType="flat"
        >
          {formatMessage({ id: 'refresh' })}
        </Button>
      </Header>
      <Breadcrumb />
      <Content>
        <Loading display type="c7n" />
      </Content>
    </>
  );
}

export default function EmptyShown({ access, onClick, openImport }) {
  const {
    intl: { formatMessage },
    AppState: {
      currentMenuType: {
        id: projectId,
      },
    },
    appServiceStore,
    intlPrefix,
  } = useAppTopStore();

  function refresh() {
    appServiceStore.checkHasApp(projectId);
  }

  return (
    <>
      <Header>
        <HeaderButtons
          items={[{
            name: formatMessage({ id: `${intlPrefix}.create` }),
            icon: 'playlist_add',
            permissions: ['choerodon.code.project.develop.app-service.ps.create'],
            display: true,
            handler: onClick,
          }, {
            name: formatMessage({ id: `${intlPrefix}.import` }),
            icon: 'archive-o',
            permissions: ['choerodon.code.project.develop.app-service.ps.import'],
            display: true,
            handler: openImport,
          }, {
            icon: 'refresh',
            display: true,
            handler: refresh,
          }]}
        />
      </Header>
      <Breadcrumb />
      <Content>
        <EmptyPage
          image={emptyImage}
          description={access ? (
            <>
              {formatMessage({ id: 'empty.tips.app-list.des.owner' })}
              <EmptyPage.Button onClick={onClick}>
                请创建
              </EmptyPage.Button>
            </>
          ) : formatMessage({ id: 'empty.tips.app.member' })}
        />
      </Content>
    </>
  );
}
