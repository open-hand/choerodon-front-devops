import React, {
  useEffect, FC,
} from 'react';
import { observer } from 'mobx-react-lite';
import { useFormatCommon } from '@choerodon/master';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { get } from 'lodash';
import { OverflowWrap } from '@choerodon/components';
import ParalleLines from '../paralle-lines';
import { JOB_GROUP_TYPES } from '../../../../stores/CONSTANTS';

import './index.less';
import SerialLines from '../serial-lines';
import useStageEdit from '../../hooks/useStageEdit';

export type JobProps = {
  id:string
  name:string
  jobIndex:number
  showLines:boolean
  ciTemplateJobGroupDTO: {
    type: keyof typeof JOB_GROUP_TYPES // job的分组类型
  }
  linesType: 'paralle' | 'serial'
  handleJobDeleteCallback: (jobIndex:number)=>void
  handleJobEditCallback:(jobIndex:number, jobData:Record<string, any>)=>void
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
    jobIndex,
    showLines = true,

    handleJobDeleteCallback,
    handleJobEditCallback,
  } = props;

  const currentJobGroupType = JOB_GROUP_TYPES[groupType];

  const formatCommon = useFormatCommon();
  // const formatJob = useFormatMessage(intlPrefix);

  const linesMap:Record<string, any> = {
    paralle: <ParalleLines />,
    serial: <SerialLines />,
  };

  const handleJobDelete = (e:any) => {
    e?.stopPropagation();
    handleJobDeleteCallback(jobIndex);
  };

  /**
   * 编辑job的数据
   * @param {Record<string, any>} jobData
   */
  const handleEditJobData = (jobData:Record<string, any>) => {
    handleJobEditCallback(jobIndex, jobData);
  };

  const handleOpenEditJobModal = () => {
    // 保存数据的时候掉用handleEditJobData 方法
  };

  return (
    <div className={prefixCls}>
      {showLines && linesMap[linesType]}
      <div className={`${prefixCls}-content`} role="none" onClick={handleOpenEditJobModal}>
        <Tooltip title={get(currentJobGroupType, 'name')}>
          <Icon className={`${`${prefixCls}`}-icon`} type={get(currentJobGroupType, 'icon')} />
        </Tooltip>

        <OverflowWrap className={`${prefixCls}-name`} width={120}>
          {name}
        </OverflowWrap>
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
