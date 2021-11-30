import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon, useFormatMessage } from '@choerodon/master';
import map from 'lodash/map';
import {} from 'choerodon-ui/pro';
import {} from '@choerodon/components';

import './index.less';
import JobItem from '../job-item';

export type StageProps = {
  type: 'CI' | 'CD'
  name: string
  jobList: any[]
} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-stage';

const Stage:FC<StageProps> = (props) => {
  const {
    type: stageType,
    name: stageName,
    jobList = [],
  } = props;

  const formatCommon = useFormatCommon();
  // const formatStage = useFormatMessage(intlPrefix);

  const renderJobs = () => map(jobList, (item, index:number) => <JobItem {...item} />);

  return (
    <div className={prefixCls}>
      <header>
        <div className={`${prefixCls}-stageType`}>{stageType}</div>
        <div className={`${prefixCls}-stageName`}>{stageName}</div>
      </header>
      <main>
        {renderJobs()}
      </main>
    </div>
  );
};

export default Stage;
