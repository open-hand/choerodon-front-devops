import React, { useEffect, useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, nomatch } from '@choerodon/boot';
import { PermissionRoute, Charts } from '@choerodon/master';
import { ModalContainer } from 'choerodon-ui/pro';

import './style/index.less';

const AppService = React.lazy(() => import('./routes/app-service'));
const Code = React.lazy(() => import('./routes/code-manager'));
const Resource = React.lazy(() => import('./routes/resource'));
const Deployment = React.lazy(() => import('./routes/deployment'));
const Pipeline = React.lazy(() => import('./routes/pipeline'));
const Certificate = React.lazy(() => import('./routes/certificate'));
const Cluster = React.lazy(() => import('./routes/cluster'));
const Environment = React.lazy(() => import('./routes/environment'));
const DeployReports = React.lazy(() => import('./routes/reports/DeployReportsIndex'));
const DevelopReports = React.lazy(() => import('./routes/reports/ReportsIndex'));
const Repository = React.lazy(() => import('./routes/repository'));
const ProRepository = React.lazy(() => import('./routes/pro-repository'));
const PVManager = React.lazy(() => import('./routes/pv-manager'));
const PipelineManage = React.lazy(() => import('./routes/pipeline-manage'));
const HostConfig = React.lazy(() => import('./routes/host-config'));
const OrgTemplate = React.lazy(() => import('./routes/app-template/OrgIndex'));
const SiteTemplate = React.lazy(() => import('./routes/app-template/SiteIndex'));
const AppCenter = React.lazy(() => import('./routes/app-center-pro'));
const AppCenter2 = React.lazy(() => import('./routes/app-center'));

function DEVOPSIndex({ match, AppState: { currentLanguage: language } }) {
  const IntlProviderAsync = useMemo(() => asyncLocaleProvider(language, () => import(`./locale/${language}`)), []);
  return (
    <IntlProviderAsync>
      <div className="c7ncd-root">
        <Switch>
          <PermissionRoute path={`${match.url}/app-service`} service={['choerodon.code.project.develop.app-service.ps.default']} component={AppService} />
          <PermissionRoute path={`${match.url}/code-management`} component={Code} service={['choerodon.code.project.develop.code-management.ps.default']} />
          <PermissionRoute path={`${match.url}/resource`} component={Resource} service={['choerodon.code.project.deploy.app-deployment.resource.ps.default']} />
          <PermissionRoute path={`${match.url}/deployment-operation`} component={Deployment} service={['choerodon.code.project.deploy.app-deployment.deployment-operation.ps.default']} />
          <PermissionRoute path={`${match.url}/pipeline-manage`} component={PipelineManage} service={['choerodon.code.project.develop.ci-pipeline.ps.default']} />
          <PermissionRoute path={`${match.url}/pipeline`} component={Pipeline} service={['choerodon.code.project.deploy.app-deployment.pipeline.ps.default']} />
          <PermissionRoute path={`${match.url}/environment`} component={Environment} service={['choerodon.code.project.deploy.environment.ps.default']} />
          <PermissionRoute path={`${match.url}/cert-management`} component={Certificate} service={['choerodon.code.project.deploy.cluster.cert-management.ps.default']} />
          <PermissionRoute path={`${match.url}/cluster-management`} component={Cluster} service={['choerodon.code.project.deploy.cluster.cluster-management.ps.default']} />
          <PermissionRoute path={`${match.url}/repository`} component={Repository} service={['choerodon.code.organization.setting.repository.ps.default']} />
          <PermissionRoute path={`${match.url}/project-repository`} component={ProRepository} service={['choerodon.code.project.setting.setting-repository.ps.default']} />
          <PermissionRoute path={`${match.url}/pv-management`} component={PVManager} service={['choerodon.code.project.deploy.cluster.pv-management.ps.default']} />
          <PermissionRoute path={`${match.url}/host-config`} component={HostConfig} service={['choerodon.code.project.deploy.host.ps.default']} />
          <PermissionRoute
            service={['choerodon.code.organization.manager.application-template.ps.default']}
            path={`${match.url}/org-template`}
            component={OrgTemplate}
          />
          <PermissionRoute
            service={['choerodon.code.site.manager.application-template.ps.default']}
            path={`${match.url}/application-template`}
            component={SiteTemplate}
          />
          <PermissionRoute
            service={['choerodon.code.project.develop.chart.ps.default']}
            path={`${match.url}/charts/develop`}
            component={DevelopReports}
          />
          <PermissionRoute
            service={['choerodon.code.project.deploy.chart.ps.default']}
            path={`${match.url}/charts/deploy`}
            component={DeployReports}
          />
          <PermissionRoute
            service={['choerodon.code.project.deploy.app-deployment.application-center.default']}
            path={`${match.url}/application-center`}
            component={AppCenter}
          />
          {/* <PermissionRoute
            service={[]}
            path={`${match.url}/application-center2`}
            component={AppCenter2}
          /> */}
          <Route path="*" component={nomatch} />
        </Switch>
        <ModalContainer />
      </div>
    </IntlProviderAsync>
  );
}

export default inject('AppState')(DEVOPSIndex);
