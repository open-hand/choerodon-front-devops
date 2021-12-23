import React, {
  createContext, FC, Suspense,
} from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { Loading } from '@choerodon/components';

import './index.less';
import { TabkeyTypes } from './interface';

const AppHomePage = React.lazy(() => import('./routes/pipeline-manage'));
const AppPipelineEdit = React.lazy(() => import('./routes/app-pipeline-edit'));

export type AppPipelineProps = {
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
    'create': Promise<any> | ''
    'modify':Promise<any> | ''
  }>
  basicInfo?: {
    Component:React.ReactElement
    key: string
  }
};

export const Stores = createContext<AppPipelineProps>({});

const prefixCls = 'c7ncd-app-pipeline';
const intlPrefix = 'c7ncd.app.pipeline';

const AppPipeline: FC<AppPipelineProps> = (props) => {
  const match = useRouteMatch();
  const {
    HomePage,
    ...rest
  } = props;

  return (
    <Stores.Provider value={rest}>
      <Suspense fallback={<Loading type="c7n" />}>
        <Switch>
          <Route
            exact
            path={match.url}
            component={HomePage || AppHomePage}
          />
          <Route
            exact
            path={`${match.url}/edit/:type/:id`}
            component={AppPipelineEdit}
          />
        </Switch>
      </Suspense>
    </Stores.Provider>
  );
};

export default AppPipeline;
