import React from 'react';
import { Route, Switch } from 'react-router';
import { nomatch } from '@choerodon/boot';
import { StoreProvider } from './stores';

const AppList = React.lazy(() => import('./app-list'));
const AppDetail = React.lazy(() => import('./app-detail'));

// 详情页url: /detail/应用服务id/应用服务类型（项目、共享、市场）/tabKey(env或host)

export default (props: any) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={AppList} />
        <Route exact path={`${match.url}/detail/:id/:type/:typeKey`} component={AppDetail} />
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};
