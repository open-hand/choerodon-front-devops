import React from 'react';
import { Route, Switch } from 'react-router';
import { nomatch } from '@choerodon/boot';
import { StoreProvider } from './stores';

const AppList = React.lazy(() => import('./app-list'));
const AppDetail = React.lazy(() => import('./app-detail'));

export default (props: any) => {
  const { match } = props;

  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={AppList} />
        <Route exact path={`${match.url}/detail/:id/:type`} component={AppDetail} />
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};
