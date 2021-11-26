import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import {} from '@choerodon/master';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';

import './index.less';

export type AppPipelineProps = {

}

const prefixCls = 'c7ncd-app-pipeline';
const intlPrefix = 'c7ncd.app.pipeline';

const AppPipeline:FC<AppPipelineProps> = (props) => {
  const {

  } = props;

  useEffect(() => {

  }, []);

  return (
    <div className={prefixCls}>
      AppPipeline
    </div>
  );
};

export default AppPipeline;
