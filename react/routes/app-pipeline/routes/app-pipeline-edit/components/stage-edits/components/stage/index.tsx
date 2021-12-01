import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import map from 'lodash/map';
import {} from '@choerodon/components';
import { Icon } from 'choerodon-ui/pro';

import './index.less';

import JobItem from '../job-item';
import JobAddBtn from '../job-btn';
import { STAGE_TYPES } from '../../../../interface';

export type StageProps = {
  type: STAGE_TYPES
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
        <div className={`${prefixCls}-btnGroups`}>
          <Icon type="delete_black-o" className={`${prefixCls}-btnGroups-delete`} />
        </div>
      </header>
      <main>
        {renderJobs()}
      </main>
      <footer>
        <JobAddBtn type={jobList.length ? 'circle' : 'normal'} />
      </footer>
    </div>
  );
};

export default Stage;
