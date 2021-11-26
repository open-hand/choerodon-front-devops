/* eslint-disable react/jsx-no-bind */
import React, { Fragment, useEffect, useState } from 'react';
import { Header, Content, Breadcrumb } from '@choerodon/master';
import { Button } from 'choerodon-ui';
import { Loading } from '@choerodon/components';
import EmptyPage from '../../../../components/empty-page';
import checkPermission from '../../../../utils/checkPermission';
import { useCodeManagerStore } from '../../stores';

export function EmptyLoading({ formatMessage }) {
  return (
    <>
      <Header>
        <Button
          icon="refresh"
          type="primary"
          funcType="flat"
        >
          {formatMessage({ id: 'boot.refresh' })}
        </Button>
      </Header>
      <Breadcrumb />
      <Content>
        <Loading display type="c7n" />
      </Content>
    </>
  );
}

export default function EmptyShown() {
  const {
    intl: { formatMessage },
    AppState: {
      currentMenuType: {
        id: projectId,
        organizationId,
      },
    },
    codeManagerStore,
  } = useCodeManagerStore();
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function judgeRole() {
      const data = {
        code: 'choerodon.code.project.develop.app-service.ps.create',
        projectId,
        organizationId,
        resourceType: 'project',
      };
      try {
        const res = await checkPermission(data);
        setAccess(res);
        setLoading(false);
      } catch (e) {
        setAccess(false);
      }
    }
    judgeRole();
  }, []);

  function refresh() {
    codeManagerStore.checkHasApp(projectId);
  }

  return (
    <>
      <Header>
        <Button
          icon="refresh"
          type="primary"
          funcType="flat"
          onClick={refresh}
        >
          {formatMessage({ id: 'boot.refresh' })}
        </Button>
      </Header>
      <Breadcrumb />
      <Content>
        {!loading ? (
          <EmptyPage
            title={formatMessage({ id: `empty.title.${access ? 'app' : 'prohibited'}` })}
            describe={formatMessage({ id: `empty.tips.app.${access ? 'owner' : 'member'}` })}
            pathname="/devops/app-service"
            access={access}
            btnText={formatMessage({ id: 'empty.link.app' })}
          />
        ) : <Loading display type="c7n" />}
      </Content>
    </>
  );
}
