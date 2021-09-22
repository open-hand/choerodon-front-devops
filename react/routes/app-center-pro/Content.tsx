/* eslint-disable max-len */
import React, { useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { PermissionRoute } from '@choerodon/master';
import { nomatch } from '@choerodon/boot';
import map from 'lodash/map';

import { observer } from 'mobx-react-lite';
import { useAppCenterProStore } from './stores';
import { AppDeletionsModal } from '@/components/app-deletion-with-vertification-code';

const AppHomePage = React.lazy(() => import('./routes/app-home-page'));
const AppDetail = React.lazy(() => import('./routes/app-detail'));

// 项目服务 | 项目制品库 | 共享服务 === normal
// 市场服务 |HZERO服务 === market
// 主机 === host
// 详情页url: /detail/应用服务id/制品来源chartSource（ normal|  market | hzero | share | middleware ）/ 部署类型deployType(env或host) / rdupmType区分是部署组还是chart组，或者只是主机的jar包

// deployTypeId 如果时环境env，就是envId如果是主机，就是hostId

const AppCenterPro = observer(() => {
  const {
    match,
    deletionStore,
    formatMessage,
  } = useAppCenterProStore();

  const {
    getDeleteArr,
  } = deletionStore;

  const deleteModals = useMemo(() => (
    map(getDeleteArr, ({
      name, display, deleteId, type, refresh, envId,
    }) => (
      <AppDeletionsModal
        key={deleteId}
        envId={envId}
        store={deletionStore}
        title={`${formatMessage({ id: `${type}.delete` })}“${name}”`}
        visible={display}
        objectId={deleteId}
        objectType={type}
        refresh={refresh}
      />
    ))
  ), [deletionStore, formatMessage, getDeleteArr]);

  return (
    <>
      {deleteModals}
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
        <PermissionRoute service={['choerodon.code.project.deploy.app-deployment.application-center.details']} exact path={`${match.url}/detail/:appId/:chartSource/:deployType/:deployTypeId/:rdupmType`} component={AppDetail} />
        <Route path="*" component={nomatch} />
      </Switch>
    </>
  );
});

export default AppCenterPro;
