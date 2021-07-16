import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from '@choerodon/boot';
import { Charts, PermissionRoute } from '@choerodon/master';
import { has, get } from '@choerodon/inject';
import { StoreProvider } from './stores';

const securityGet = (code, notfound = nomatch) => (has(code) ? get(code) : () => notfound);

const SUBMISSION = asyncRouter(() => import('./Submission'));
const BUILDNUMBER = asyncRouter(() => import('./BuildNumber'));
const BUILDDURATION = asyncRouter(() => import('./BuildDuration'));
const PipelineTriggerNumber = asyncRouter(() => import('./PipelineTriggerNumberChart'));
const PipelineDuration = asyncRouter(() => import('./pipeline-duration'));
const TableDesignWorkplace = asyncRouter(securityGet('rdqam:tableDesignWorkplace'));
const CodeQualityWorkplace = asyncRouter(securityGet('rdqam:codeQualityWorkplace'));

const ReportsIndex = (props) => {
  const { match } = props;
  return (
    <StoreProvider {...props}>
      <Switch>
        <Route exact path={match.url} component={() => <Charts reportType="develop" />} />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.commit']}
          path={`${match.url}/submission`}
          component={SUBMISSION}
        />
        <Route
          path={`${match.url}/design-quality-workplace`}
          component={TableDesignWorkplace}
        />
        <Route
          path={`${match.url}/code-quality-workplace`}
          component={CodeQualityWorkplace}
        />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.build.times']}
          path={`${match.url}/build-number`}
          component={BUILDNUMBER}
        />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.build.duration']}
          path={`${match.url}/build-duration`}
          component={BUILDDURATION}
        />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.pipeline.times']}
          path={`${match.url}/pipelineTrigger-number`}
          component={PipelineTriggerNumber}
        />
        <PermissionRoute
          service={['choerodon.code.project.operation.chart.ps.pipeline.duration']}
          path={`${match.url}/pipeline-duration`}
          component={PipelineDuration}
        />
        <Route path="*" component={nomatch} />
      </Switch>
    </StoreProvider>
  );
};

export default ReportsIndex;
