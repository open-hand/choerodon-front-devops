import React, {
  FC,
} from 'react';
import { useFormatCommon } from '@choerodon/master';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { omit, get } from 'lodash';

import { OverflowWrap, InfoIcon } from '@choerodon/components';
import classNames from 'classnames';
import { handlePipelineModal } from '@/routes/app-pipeline/routes/app-pipeline-edit/components/stage-edits/components/job-btn/components/job-types-panel';
import { TAB_ADVANCE_SETTINGS, JOB_GROUP_TYPES } from '../../../../stores/CONSTANTS';
import ParalleLines from '../paralle-lines';

import './index.less';
import SerialLines from '../serial-lines';
import useTabData from '../../../../hooks/useTabData';
import usePipelineContext from '@/routes/app-pipeline/hooks/usePipelineContext';

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
    completed,
    ciTemplateJobGroupDTO,
    linesType,
    jobIndex,
    showLines = true,

    handleJobDeleteCallback,
    handleJobEditCallback,
  } = props;

  const { type: groupType } = ciTemplateJobGroupDTO || {};

  const [_data, _setData, getTabDataByKey] = useTabData();
  const { level } = usePipelineContext();

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
    const basicInfoTabAppServiceData = level === 'project' ? getTabDataByKey('basicInfo')?.appService : {};
    const modifyData = omit({ ...props, appService: basicInfoTabAppServiceData }, ['linesType', 'showLines', 'handleJobDeleteCallback', 'handleJobEditCallback']);
    handlePipelineModal(
      modifyData,
      handleEditJobData,
      getTabDataByKey(TAB_ADVANCE_SETTINGS),
      level,
    );
  };

  const jobContentCls = classNames(`${prefixCls}-content`, {
    [`${prefixCls}-content-notComplete`]: !completed,
  });

  return (
    <div className={prefixCls}>
      {showLines && linesMap[linesType]}
      <div className={jobContentCls} role="none" onClick={handleOpenEditJobModal}>
        <Tooltip title={get(currentJobGroupType, 'name')}>
          <Icon className={`${`${prefixCls}`}-icon`} type={get(currentJobGroupType, 'icon')} />
        </Tooltip>

        <OverflowWrap className={`${prefixCls}-name`} width={120}>
          {name}
        </OverflowWrap>
        <div className={`${prefixCls}-iconGroups`}>
          {!completed && (
          <InfoIcon
            className={`${prefixCls}-iconGroups-notComplete`}
          />
          )}
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
