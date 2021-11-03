import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, NoMatch } from '@choerodon/master';

const PipelineHome = asyncRouter(() => import('./pipeline-table'), () => import('./pipeline-table/stores'));
const PipelineCreate = asyncRouter(() => import('./pipeline-create'), () => import('./stores'));
const PipelineEdit = asyncRouter(() => import('./pipeline-edit'), () => import('./stores'));

const PipelineIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={PipelineHome} />
    <Route path={`${match.url}/create`} component={PipelineCreate} />
    <Route path={`${match.url}/edit/:id`} component={PipelineEdit} />
    <Route path="*" component={NoMatch} />
  </Switch>
);

export default PipelineIndex;
