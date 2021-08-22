/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { Route, Switch } from 'react-router';
import { nomatch } from '@choerodon/boot';
import { StoreProvider } from './stores';

// const AppList = React.lazy(() => import('./app-list'));
const AppHomePage = React.lazy(() => import('./routes/app-home-page'));
const AppDetail = React.lazy(() => import('./routes/app-detail'));

// 项目服务 | 项目制品库 | 共享服务 === normal
// 市场服务 |HZERO服务 === market
// 主机 === host
// 详情页url: /detail/应用服务id/制品来源（ normal|  market | host ）/ 部署类型deployType(env或host) / rdupmType区分是部署组还是chart组，或者只是主机的jar包 / 启用 | 停用 | 处理中 | 失败 | 成功

// deployTypeId 如果时环境env，就是envId如果是主机，就是hostId
export default (props: any) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
        <Route exact path={`${match.url}/detail/:appId/:appSource/:deployType/:deployTypeId/:rdupmType/:status`} component={AppDetail} />
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};
