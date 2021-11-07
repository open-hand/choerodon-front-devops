import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, NoMatch } from '@choerodon/master';
import { Charts, PermissionRoute } from '@choerodon/master';

import { StoreProvider } from './stores';

const DeployTimes = asyncRouter(() => import('./DeployTimes'));
const DeployDuration = asyncRouter(() => import('./DeployDuration'));

const ReportsIndex = (props) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={() => <Charts reportType="deploy" />} />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.deploy.times']}
          path={`${match.url}/deploy-times`}
          component={DeployTimes}
        />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.deploy.duration']}
          path={`${match.url}/deploy-duration`}
          component={DeployDuration}
        />
        <Route path="*" component={NoMatch} />
      </Switch>
    </StoreProvider>
  );
};

export default ReportsIndex;
