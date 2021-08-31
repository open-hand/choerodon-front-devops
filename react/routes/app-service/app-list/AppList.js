import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { Page } from '@choerodon/boot';
import { Modal } from 'choerodon-ui/pro';
import checkPermission from '../../../utils/checkPermission';
import ListView from './ListView';
import EmptyShown from './EmptyShown';
import { useAppTopStore } from '../stores';
import { useAppServiceStore } from './stores';
import CreateForm from '../modals/creat-form';
import { SMALL, LARGE } from '../../../utils/getModalWidth';
import ImportForm from './modal/import-form';

import './index.less';

const createModalKey = Modal.key();
const importModalKey = Modal.key();

const AppService = withRouter(observer(() => {
  const {
    appServiceStore,
    intlPrefix,
    prefixCls,
  } = useAppTopStore();
  const {
    intl: { formatMessage },
    AppState: {
      currentMenuType: {
        id: projectId,
        organizationId,
      },
    },
    listDs,
    appListStore,
  } = useAppServiceStore();

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
    listDs.query();
    appListStore.checkCreate(projectId);
  }

  function openCreate() {
    Modal.open({
      key: createModalKey,
      drawer: true,
      style: {
        width: SMALL,
      },
      title: formatMessage({ id: `${intlPrefix}.create` }),
      children: <CreateForm
        refresh={refresh}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
      />,
      okText: formatMessage({ id: 'create' }),
    });
  }

  function openImport() {
    Modal.open({
      key: importModalKey,
      drawer: true,
      style: { width: LARGE },
      title: formatMessage({ id: `${intlPrefix}.import` }),
      children: <ImportForm
        appServiceStore={appServiceStore}
        intlPrefix={intlPrefix}
        prefixCls={prefixCls}
        refresh={refresh}
      />,
      okText: formatMessage({ id: 'import' }),
    });
  }

  function getContent() {
    const {
      getHasApp: hasApp,
    } = appServiceStore;

    let content;
    if (!hasApp) {
      content = <EmptyShown access={access} onClick={openCreate} openImport={openImport} />;
    } else {
      content = <ListView openCreate={openCreate} openImport={openImport} />;
    }
    return content;
  }

  return (
    <Page>
      {getContent()}
    </Page>
  );
}));

export default AppService;
