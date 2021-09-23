import React, { Fragment, useEffect, useState } from 'react';
import { HeaderButtons } from '@choerodon/master';
import { Loading } from '@choerodon/components';
import checkPermission from '../../../../../utils/checkPermission';
import EmptyPage from '../../../../../components/empty-page';
import { useResourceStore } from '../../../stores';

export default function EmptyShown() {
  const {
    intl: { formatMessage },
    treeDs,
    AppState: {
      currentMenuType: {
        id: projectId,
        organizationId,
      },
    },
  } = useResourceStore();
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function judgeRole() {
      const data = {
        code: 'choerodon.code.project.deploy.environment.ps.group-add-env',
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
    treeDs.query();
  }

  function getButtons() {
    return [{
      icon: 'refresh',
      handler: refresh,
      display: true,
    }];
  }

  return (
    <>
      <HeaderButtons items={getButtons()} showClassName />
      {!loading ? (
        <EmptyPage
          title={formatMessage({ id: `empty.title.${access ? 'env' : 'prohibited'}` })}
          describe={formatMessage({ id: `empty.tips.env.${access ? 'owner' : 'member'}` })}
          pathname="/devops/environment"
          access={access}
          btnText={formatMessage({ id: 'empty.link.env' })}
        />
      ) : <Loading display type="c7n" />}
    </>
  );
}
