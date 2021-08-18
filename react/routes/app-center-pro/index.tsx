/* eslint-disable max-len */
/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import { Route, Switch } from 'react-router';
import { nomatch } from '@choerodon/boot';
import { StoreProvider } from './stores';

// const AppList = React.lazy(() => import('./app-list'));
const AppHomePage = React.lazy(() => import('./routes/app-home-page'));

// 详情页url: /detail/应用服务id/应用服务类型（项目、共享、市场）/tabKey(env或host)

export default (props: any) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
        {/* <Route exact path={`${match.url}/detail/:id/:type/:typeKey`} component={AppDetail} /> */}
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};
