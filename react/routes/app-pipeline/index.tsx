import React, {
  createContext, FC, Suspense, useMemo,
} from 'react';
import { Switch, Route } from 'react-router-dom';
import { PermissionRoute } from '@choerodon/master';
import { useRouteMatch } from 'react-router';
import { Loading } from '@choerodon/components';

import './index.less';
import { TabkeyTypes } from './interface';

const AppHomePage = React.lazy(() => import('./routes/pipeline-manage'));
const AppPipelineEdit = React.lazy(() => import('./routes/app-pipeline-edit'));

export type AppPipelineProps = {
  permissions?:{
    editPagePermissions?: string[],
  }
  defaultTabKey?:TabkeyTypes,
  // 项目 平台 组织层
  level?: 'project' | 'site' | 'orgnization',
  // 创建的时候的回调
  onCreate?:(data:any)=>void
  // 保存的时候的回调
  onSave?:(data:any)=>void
  // 主页面
  HomePage?: React.LazyExoticComponent<(props: unknown) => JSX.Element>
  tabApis?:Record<TabkeyTypes|string, {
    'create': (id:string|number)=>Promise<any> | ''
    'modify':(id:string|number) => Promise<any> | ''
  }>
  basicInfo?: { // 第一个tab页的配置项
    Component:React.ReactElement
    key: string
  }
  jobGroupsApi?: Promise<any> // 阶段的下拉列表
  jobPanelApiCallback?: (jobGroupId:string|number) => Promise<any> // 根据阶段的下拉列表的某一项获取子下拉列表
};

export const Stores = createContext<AppPipelineProps>({
  level: 'project',
});

const prefixCls = 'c7ncd-app-pipeline';
const intlPrefix = 'c7ncd.app.pipeline';

const AppPipeline: FC<AppPipelineProps> = (props) => {
  const match = useRouteMatch();
  const {
    HomePage,
    level = 'project',
    permissions = {},
    ...rest
  } = props;

  const {
    editPagePermissions = [],
  } = permissions;

  const getPermissions = useMemo(() => {
    if (level === 'project') {
      return ['choerodon.code.project.develop.ci-pipeline.ps.edit'];
    }
    return editPagePermissions;
  }, []);

  return (
    <Stores.Provider value={{ ...rest, level }}>
      <Suspense fallback={<Loading type="c7n" />}>
        <Switch>
          <Route
            exact
            path={match.url}
            component={HomePage || AppHomePage}
          />
          <PermissionRoute
            exact
            service={getPermissions}
            path={`${match.url}/edit/:type/:id`}
            component={AppPipelineEdit}
          />
        </Switch>
      </Suspense>
    </Stores.Provider>
  );
};

export default AppPipeline;
