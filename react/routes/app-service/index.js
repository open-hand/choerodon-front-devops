import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, NoMatch } from '@choerodon/master';
import { StoreProvider } from './stores';
import './styles/safari.less';

const AppList = asyncRouter(() => import('./app-list'));
const ServiceDetail = asyncRouter(() => import('./service-detail'));

export default ({ match }) => (
  <StoreProvider>
    <AppList />
  </StoreProvider>
);
