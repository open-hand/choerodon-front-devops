import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { get } from 'lodash';
// import SerialLines from './components/serial-lines';
import ParalleLines from '../paralle-lines';
import { JOB_GROUP_TYPE } from '../../../../stores/CONSTANTS';

import './index.less';

export type JobProps = {
  groupType: keyof typeof JOB_GROUP_TYPE // job的分组类型
  id:string
  name:string
} & Record<string, any>

const prefixCls = 'c7ncd-pipeline-jobItem';

const JobItem:FC<JobProps> = (props) => {
  const {
    id: jobId,
    name,
    type: jobType,
    groupType,
  } = props;

  const currentJobGroupType = JOB_GROUP_TYPE[groupType];

  const formatCommon = useFormatCommon();
  // const formatJob = useFormatMessage(intlPrefix);

  return (
    <div className={prefixCls}>
      {/* <SerialLines /> */}
      <ParalleLines />
      <div className={`${prefixCls}-content`}>
        <Tooltip title={get(currentJobGroupType, 'name')}>
          <Icon className={`${`${prefixCls}`}-icon`} type={get(currentJobGroupType, 'icon')} />
        </Tooltip>
        <span className={`${prefixCls}-name`}>{name}</span>

        <div className={`${prefixCls}-iconGroups`}>
          <Icon type="delete_black-o" className={`${prefixCls}-iconGroups-delete`} />
        </div>
      </div>
    </div>
  );
};

export default JobItem;
