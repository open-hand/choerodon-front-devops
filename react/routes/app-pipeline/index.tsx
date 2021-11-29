import React, {
  useEffect, FC, Suspense,
} from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import {} from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import { Loading } from '@choerodon/components';

import './index.less';

const AppHomePage = React.lazy(() => import('./routes/pipeline-manage'));

export type AppPipelineProps = {

}

const prefixCls = 'c7ncd-app-pipeline';
const intlPrefix = 'c7ncd.app.pipeline';

const AppPipeline:FC<AppPipelineProps> = (props) => {
  const match = useRouteMatch();

  useEffect(() => {

  }, []);

  return (
    <Suspense fallback={<Loading type="c7n" />}>
      <Switch>
        <Route exact path={match.url} component={AppHomePage} />
      </Switch>
    </Suspense>

  );
};

export default AppPipeline;
