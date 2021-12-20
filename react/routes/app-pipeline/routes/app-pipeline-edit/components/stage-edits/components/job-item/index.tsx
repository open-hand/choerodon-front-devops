import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { get } from 'lodash';
// import SerialLines from './components/serial-lines';
import ParalleLines from '../paralle-lines';
import { JOB_GROUP_TYPES } from '../../../../stores/CONSTANTS';

import './index.less';
import SerialLines from '../serial-lines';

export type JobProps = {
  id:string
  name:string
  jobIndex:number
  ciTemplateJobGroupDTO: {
    type: keyof typeof JOB_GROUP_TYPES // job的分组类型
  }
  linesType: 'paralle' | 'serial'
  handleJobDeleteCallback: (jobIndex:number)=>void
} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-jobItem';

const JobItem:FC<JobProps> = (props) => {
  const {
    id: jobId,
    name,
    type: jobType,
    ciTemplateJobGroupDTO: {
      type: groupType,
    },
    linesType,
    handleJobDeleteCallback,
    jobIndex,
  } = props;

  const currentJobGroupType = JOB_GROUP_TYPES[groupType];

  const formatCommon = useFormatCommon();
  // const formatJob = useFormatMessage(intlPrefix);

  const linesMap = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  };

  const handleJobDelete = (e:any) => {
    e?.stopPropagation();
    handleJobDeleteCallback(jobIndex);
  };

  return (
    <div className={prefixCls}>
      {linesMap[linesType]}
      <div className={`${prefixCls}-content`}>
        <Tooltip title={get(currentJobGroupType, 'name')}>
          <Icon className={`${`${prefixCls}`}-icon`} type={get(currentJobGroupType, 'icon')} />
        </Tooltip>
        <span className={`${prefixCls}-name`}>{name}</span>
        <div className={`${prefixCls}-iconGroups`}>
          <Icon
            onClick={handleJobDelete}
            type="delete_black-o"
            className={`${prefixCls}-iconGroups-delete`}
          />
        </div>
      </div>
    </div>
  );
};

export default JobItem;
