import React, {
  FC, Suspense,
} from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { Loading } from '@choerodon/components';

import './index.less';

const AppHomePage = React.lazy(() => import('./routes/pipeline-manage'));
const AppPipelineEdit = React.lazy(() => import('./routes/app-pipeline-edit'));

export type AppPipelineProps = {

}

const prefixCls = 'c7ncd-app-pipeline';
const intlPrefix = 'c7ncd.app.pipeline';

const AppPipeline:FC<AppPipelineProps> = () => {
  const match = useRouteMatch();

  return (
    <Suspense fallback={<Loading type="c7n" />}>
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
        <Route exact path={`${match.url}/edit/:type/:id`} component={AppPipelineEdit} />
      </Switch>
    </Suspense>
  );
};

export default AppPipeline;
