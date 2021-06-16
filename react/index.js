import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncRouter, asyncLocaleProvider, nomatch } from '@choerodon/boot';
import { PermissionRoute, Charts } from '@choerodon/master';
import { ModalContainer } from 'choerodon-ui/pro';

import './style/index.less';

const AppService = asyncRouter(() => import('./routes/app-service'));
const Code = asyncRouter(() => import('./routes/code-manager'));
const Resource = asyncRouter(() => import('./routes/resource'));
const Deployment = asyncRouter(() => import('./routes/deployment'));
const Pipeline = asyncRouter(() => import('./routes/pipeline'));
const Certificate = asyncRouter(() => import('./routes/certificate'));
const Cluster = asyncRouter(() => import('./routes/cluster'));
const Environment = asyncRouter(() => import('./routes/environment'));
const Reports = asyncRouter(() => import('./routes/reports'));
const Repository = asyncRouter(() => import('./routes/repository'));
const ProRepository = asyncRouter(() => import('./routes/pro-repository'));
const PVManager = asyncRouter(() => import('./routes/pv-manager'));
const PipelineManage = asyncRouter(() => import('./routes/pipeline-manage'));
const HostConfig = asyncRouter(() => import('./routes/host-config'));
const OrgTemplate = asyncRouter(() => import('./routes/app-template/OrgIndex'));
const SiteTemplate = asyncRouter(() => import('./routes/app-template/SiteIndex'));

function DEVOPSIndex({ match, AppState: { currentLanguage: language } }) {
  const IntlProviderAsync = asyncLocaleProvider(language, () => import(`./locale/${language}`));
  return (
    <IntlProviderAsync>
      <div className="c7ncd-root">
        <Switch>
          <PermissionRoute path={`${match.url}/app-service`} component={AppService} service={['choerodon.code.project.develop.app-service.ps.default']} />
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
          <Route path={`${match.url}/reports`} component={Reports} />
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
            path={`${match.url}/charts/develop`}
            component={() => <Charts reportType="develop" service={['choerodon.code.project.develop.chart.ps.default']} />}
          />
          <PermissionRoute
            path={`${match.url}/charts/deploy`}
            component={() => <Charts reportType="deploy" service={['choerodon.code.project.deploy.chart.ps.default']} />}
          />
          <Route path="*" component={nomatch} />
        </Switch>
        <ModalContainer />
      </div>
    </IntlProviderAsync>
  );
}

export default inject('AppState')(DEVOPSIndex);
