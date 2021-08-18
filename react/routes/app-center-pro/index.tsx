/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { Route, Switch } from 'react-router';
import { nomatch } from '@choerodon/boot';
import { StoreProvider } from './stores';

// const AppList = React.lazy(() => import('./app-list'));
const AppHomePage = React.lazy(() => import('./routes/app-home-page'));
const AppDetail = React.lazy(() => import('./routes/app-detail'));

// 详情页url: /detail/应用服务id/应用服务来源（项目服务 | 项目制品库 | 共享服务 |市场服务 |HZERO服务 | 所有来源）/ 部署类型deployType(env或host) / 启用 | 停用 | 处理中 | 失败 | 成功

export default (props: any) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
        <Route exact path={`${match.url}/detail/:id/:source/:deployType/:status`} component={AppDetail} />
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};
